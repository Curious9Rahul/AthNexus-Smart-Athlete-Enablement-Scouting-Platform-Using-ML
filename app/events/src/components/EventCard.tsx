import muLogo from "../assets/mulogo.jpg";
import districtLogo from "../assets/dsoimage.jpg";
import stateLogo from "../assets/statelevel .jpg";
import nationalLogo from "../assets/national level.jpg";
import kheloIndiaLogo from "../assets/kheloindia logo.jpg";
import type { Event } from "../types";

type Props = {
  event: Event;
  hasRequested: boolean;
  onDetails: (eventId: number) => void;
  onRequestParticipation: (eventId: number) => void;
};

const getSportGradient = (sport: string) => {
  let hash = 0;
  for (let i = 0; i < sport.length; i += 1) {
    hash = sport.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const hueTwo = (hue + 28) % 360;
  const hueThree = (hue + 56) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 72%, 34%), hsl(${hueTwo}, 78%, 46%) 55%, hsl(${hueThree}, 82%, 66%))`;
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
  const sportGradient = getSportGradient(event.sport);
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
          <span>{event.sport}</span>
          <span>{event.gender}</span>
        </div>

        <p className="card-meta">📍 {event.location}</p>
        <p className="card-meta">📅 {relevantDateText}</p>
        <p className="card-time">⏰ {event.time}</p>

        <div className="card-actions">
          <button className="save-btn details-btn" onClick={() => onDetails(event.id)}>
            Details
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
