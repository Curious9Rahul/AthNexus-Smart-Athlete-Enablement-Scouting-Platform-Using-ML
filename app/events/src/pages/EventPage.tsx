import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard";
import FilterTabs from "../components/FilterTabs";
import SuggestEventModal from "../components/SuggestEventModal";
import { duoSports, indoorSports, soloSports, teamSports } from "../data/sportsCatalog";
import type { Event, NewEventInput, ParticipationRequest } from "../types";

const levelFilters = ["District", "Interclg", "University", "State", "Khelo India", "National", "Women"] as const;
const sportTypeFilters = [
  { id: "Indoor", label: "Indoor Sports", badge: "IN" },
  { id: "Outdoor", label: "Outdoor Sports", badge: "OUT" }
] as const;
const participationFilters = [
  { id: "Solo", label: "Solo", badge: "S" },
  { id: "Duo", label: "Duo", badge: "D" },
  { id: "Team", label: "Team", badge: "T" }
] as const;

const NEARBY_DEADLINE_HOURS = 72;

const normalizeLevel = (level: string) => {
  if (level === "Mumbai University") {
    return "University";
  }

  return level;
};

const parseTimeTo24Hour = (value: string) => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (Number.isNaN(hour) || Number.isNaN(minute) || hour < 1 || hour > 12 || minute > 59) {
    return null;
  }

  const hour24 = period === "PM" ? (hour % 12) + 12 : hour % 12;
  return { hour24, minute };
};

const parseEventWindow = (event: Event) => {
  const [startText, endTextRaw] = event.time.split("-").map((part) => part.trim());
  const endText = endTextRaw ?? startText;
  const startTime = parseTimeTo24Hour(startText);
  const endTime = parseTimeTo24Hour(endText);

  if (!startTime || !endTime) {
    const fallbackStart = new Date(event.date);
    const fallbackEnd = new Date(fallbackStart.getTime() + 2 * 60 * 60 * 1000);
    return { start: fallbackStart, end: fallbackEnd };
  }

  const [yearText, monthText, dayText] = event.date.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const start = new Date(year, month - 1, day, startTime.hour24, startTime.minute, 0, 0);
  const end = new Date(year, month - 1, day, endTime.hour24, endTime.minute, 0, 0);

  if (end.getTime() < start.getTime()) {
    end.setDate(end.getDate() + 1);
  }

  return { start, end };
};

type SportTypeFilter = (typeof sportTypeFilters)[number]["id"];
type ParticipationFilter = (typeof participationFilters)[number]["id"];

type Props = {
  events: Event[];
  participationRequests: ParticipationRequest[];
  onRequestParticipation: (eventId: number) => void;
  onSuggestEvent: (event: NewEventInput) => void;
};

const EventPage = ({ events, participationRequests, onRequestParticipation, onSuggestEvent }: Props) => {
  const [levelFilter, setLevelFilter] = useState<(typeof levelFilters)[number]>(levelFilters[0]);
  const [sportTypeFilter, setSportTypeFilter] = useState<SportTypeFilter>("Indoor");
  const [participationFilter, setParticipationFilter] = useState<ParticipationFilter>("Solo");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const now = new Date();
  const nowMs = now.getTime();
  const searchQuery = searchTerm.trim().toLowerCase();
  const navigate = useNavigate();

  const activeEvents = useMemo(
    () =>
      events.filter((event) => {
        if (normalizeLevel(event.level) === "District" || normalizeLevel(event.level) === "State") {
          return true;
        }

        const { end } = parseEventWindow(event);
        return end.getTime() > nowMs;
      }),
    [events, nowMs]
  );

  const levelFilteredEvents = useMemo(() => {
    if (levelFilter === "Women") {
      return activeEvents.filter((event) => event.gender === "Women");
    }

    return activeEvents.filter((event) => normalizeLevel(event.level) === levelFilter);
  }, [activeEvents, levelFilter]);

  const searchedEvents = useMemo(
    () =>
      levelFilteredEvents.filter((event) => {
        if (!searchQuery) {
          return true;
        }

        const searchableText = [
          event.name,
          event.sport,
          event.location,
          normalizeLevel(event.level),
          event.gender,
          event.description ?? ""
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(searchQuery);
      }),
    [levelFilteredEvents, searchQuery]
  );

  const typedEvents = useMemo(
    () =>
      Array.from(
        new Map(
          searchedEvents
            .filter((event) => {
              const isIndoor = indoorSports.has(event.sport);
              const matchesSportType = sportTypeFilter === "Indoor" ? isIndoor : !isIndoor;

              const matchesParticipationType =
                participationFilter === "Solo"
                  ? soloSports.has(event.sport)
                  : participationFilter === "Duo"
                    ? duoSports.has(event.sport)
                    : teamSports.has(event.sport);

              return matchesSportType && matchesParticipationType;
            })
            .map((event) => [event.id, event])
        ).values()
      ).sort((a, b) => parseEventWindow(a).start.getTime() - parseEventWindow(b).start.getTime()),
    [searchedEvents, sportTypeFilter, participationFilter]
  );

  const liveEvents = useMemo(
    () =>
      activeEvents
        .filter((event) => {
          const { start, end } = parseEventWindow(event);
          return nowMs >= start.getTime() && nowMs <= end.getTime();
        })
        .slice(0, 12),
    [activeEvents, nowMs]
  );

  const deadlineNearbyEvents = useMemo(
    () =>
      typedEvents.filter((event) => {
        const { start } = parseEventWindow(event);
        const diffMs = start.getTime() - nowMs;
        return diffMs > 0 && diffMs <= NEARBY_DEADLINE_HOURS * 60 * 60 * 1000;
      }),
    [typedEvents, nowMs]
  );

  const allUpcomingEvents = useMemo(() => {
    const deadlineIds = new Set(deadlineNearbyEvents.map((event) => event.id));
    return typedEvents.filter((event) => !deadlineIds.has(event.id));
  }, [typedEvents, deadlineNearbyEvents]);

  const requestedEventIds = useMemo(
    () => new Set(participationRequests.map((request) => request.eventId)),
    [participationRequests]
  );

  return (
    <div className="event-page">
      <div className="event-bg event-bg-one" />
      <div className="event-bg event-bg-two" />

      <section className="hero">
        <p className="hero-kicker">AthNexus</p>
        <h1>Find your next big sports moment</h1>
        <p className="hero-subtitle">A curated stream of opportunities built for serious athletes.</p>

        <div className="hero-metrics">
          <div className="metric-card">
            <p className="metric-label">Live Opportunities</p>
            <p className="metric-value">{liveEvents.length}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Nearby Deadlines</p>
            <p className="metric-value">{deadlineNearbyEvents.length}</p>
          </div>
        </div>
      </section>

      <div className="search-row">
        <label className="search-input-shell">
          <span>Search Events</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Type sport, venue, event name..."
          />
        </label>

        <button className="suggest-btn" onClick={() => setShowSuggestModal(true)}>
          Suggest Event
        </button>
      </div>

      <div className="filter-actions">
        <FilterTabs
          active={levelFilter}
          setActive={(value) => setLevelFilter(value as (typeof levelFilters)[number])}
          tabs={[...levelFilters]}
          ariaLabel="Event Level Filters"
        />
      </div>

      <div className="sport-type-icons" role="tablist" aria-label="Indoor and outdoor filters">
        {sportTypeFilters.map((item) => (
          <button
            key={item.id}
            className={`sport-type-icon ${sportTypeFilter === item.id ? "active" : ""}`}
            onClick={() => setSportTypeFilter(item.id)}
          >
            <span className="sport-type-badge">{item.badge}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="participation-icons" role="tablist" aria-label="Solo duo and team filters">
        {participationFilters.map((item) => (
          <button
            key={item.id}
            className={`participation-icon ${participationFilter === item.id ? "active" : ""}`}
            onClick={() => setParticipationFilter(item.id)}
          >
            <span className="sport-type-badge">{item.badge}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <p className="search-results-summary">
        {typedEvents.length} {sportTypeFilter.toLowerCase()} {participationFilter.toLowerCase()} events in {levelFilter}
      </p>

      <section className="live-carousel-section">
        <p className="section-title">Live Events Right Now</p>
        <div className="live-carousel">
          <div className="live-track">
            {liveEvents.length === 0 ? (
              <p className="empty-state">No live events. Keep grinding.</p>
            ) : (
              [...liveEvents, ...liveEvents].map((event, index) => (
                <div className="live-pill" key={`${event.id}-${index}`}>
                  <span>{event.sport}</span>
                  <span>{event.location}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="deadline-section">
        <p className="section-title">Deadline Nearby ({NEARBY_DEADLINE_HOURS}h)</p>
        <div className="events-grid">
          {deadlineNearbyEvents.length === 0 ? (
            <p className="empty-state">No deadline-near events in selected filters.</p>
          ) : (
            deadlineNearbyEvents.map((event, index) => (
              <div key={`deadline-${event.id}`} className="card-anim" style={{ animationDelay: `${index * 90}ms` }}>
                <EventCard
                  event={event}
                  hasRequested={requestedEventIds.has(event.id)}
                  onDetails={(eventId) => navigate(`/event/${eventId}`)}
                  onRequestParticipation={onRequestParticipation}
                />
              </div>
            ))
          )}
        </div>
      </section>

      <section className="all-events-section">
        <p className="section-title">All Upcoming Events</p>
        <div className="events-grid">
          {allUpcomingEvents.length === 0 ? (
            <p className="empty-state">No events found in selected filters.</p>
          ) : (
            allUpcomingEvents.map((event, index) => (
              <div key={event.id} className="card-anim" style={{ animationDelay: `${index * 90}ms` }}>
                <EventCard
                  event={event}
                  hasRequested={requestedEventIds.has(event.id)}
                  onDetails={(eventId) => navigate(`/event/${eventId}`)}
                  onRequestParticipation={onRequestParticipation}
                />
              </div>
            ))
          )}
        </div>
      </section>

      <SuggestEventModal
        isOpen={showSuggestModal}
        onClose={() => setShowSuggestModal(false)}
        onSubmit={(event) => {
          onSuggestEvent(event);
          setShowSuggestModal(false);
        }}
      />
    </div>
  );
};

export default EventPage;
