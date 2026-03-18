import muLogo from "../assets/mulogo.jpg";
import districtLogo from "../assets/dsoimage.jpg";
import stateLogo from "../assets/statelevel .jpg";
import nationalLogo from "../assets/national level.jpg";
import kheloIndiaLogo from "../assets/kheloindia logo.jpg";
import { MapPin, Calendar, Clock, Trophy, Users, ArrowRight } from "lucide-react";
import type { Event } from "../types";

type Props = {
  event: Event;
  hasRequested: boolean;
  onDetails: (eventId: number) => void;
  onRequestParticipation: (eventId: number) => void;
};

const getSportGradient = () => {
  // AthNexus Theme: Deep Slates / Blues with Lime hints
  return `linear-gradient(135deg, hsl(222, 47%, 11%) 0%, hsl(222, 47%, 20%) 100%)`;
};

const levelLogos: Record<string, string> = {
  Interclg: muLogo,
  University: muLogo,
  "Mumbai University": muLogo,
  District: districtLogo,
  State: stateLogo,
  National: nationalLogo,
  "Khelo India": kheloIndiaLogo
};

type DateCandidate = {
  label: string;
  isoDate: string;
};

const parseIsoDate = (isoDate: string) => {
  const [yearText, monthText, dayText] = isoDate.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!year || !month || !day) {
    return null;
  }

  const parsed = new Date(year, month - 1, day, 0, 0, 0, 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

const formatRelativeLabel = (today: Date, date: Date) => {
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Tomorrow";
  }

  if (diffDays > 1) {
    return `In ${diffDays} days`;
  }

  if (diffDays === -1) {
    return "Yesterday";
  }

  return `${Math.abs(diffDays)} days ago`;
};

const getRelevantDateText = (event: Event) => {
  const candidates: DateCandidate[] = [
    ...(event.submissionDeadline ? [{ label: "Submission", isoDate: event.submissionDeadline }] : []),
    ...(event.queryResolutionDeadline ? [{ label: "Query", isoDate: event.queryResolutionDeadline }] : []),
    ...(event.reportingDate ? [{ label: "Reporting", isoDate: event.reportingDate }] : []),
    { label: "Starts", isoDate: event.date },
    ...(event.tournamentEndDate ? [{ label: "Ends", isoDate: event.tournamentEndDate }] : [])
  ];

  const parsedCandidates = candidates
    .map((item) => ({ ...item, date: parseIsoDate(item.isoDate) }))
    .filter((item): item is DateCandidate & { date: Date } => Boolean(item.date));

  if (parsedCandidates.length === 0) {
    return event.date;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = parsedCandidates
    .filter((item) => item.date.getTime() >= today.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const selected =
    upcoming[0] ?? parsedCandidates.sort((a, b) => b.date.getTime() - a.date.getTime())[0];

  return `${selected.label}: ${formatDateLabel(selected.date)} (${formatRelativeLabel(today, selected.date)})`;
};

const EventCard = ({ event, hasRequested, onDetails, onRequestParticipation }: Props) => {
  const sportGradient = getSportGradient();
  const categoryLogo = levelLogos[event.level];
  const relevantDateText = getRelevantDateText(event);

  return (
    <article className="event-card">
      <div className="card-media" style={{ background: sportGradient }}>
        {categoryLogo && <img src={categoryLogo} alt={event.level} className="level-logo" />}

        <p className="media-level">{event.level}</p>
        <h3>{event.name}</h3>
      </div>

      <div className="card-content">
        <div className="card-tags">
          <span className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-lime-400" />
            {event.sport}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-lime-400" />
            {event.gender}
          </span>
        </div>

        <div className="space-y-2 mt-3">
          <p className="card-meta flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{event.location}</span>
          </p>
          <p className="card-meta flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{relevantDateText}</span>
          </p>
          <p className="card-time flex items-center gap-2">
            <Clock className="w-4 h-4 text-lime-400" />
            <span>{event.time}</span>
          </p>
        </div>

        <div className="card-actions pt-4 mt-auto border-t border-white/5">
          <button className="save-btn details-btn group" onClick={() => onDetails(event.id)}>
            Details
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            className={`save-btn request-btn ${hasRequested ? "requested" : ""}`}
            onClick={() => onRequestParticipation(event.id)}
            disabled={hasRequested}
          >
            {hasRequested ? "Request Pending" : "Request to Participate"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
