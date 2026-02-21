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

const EventCard = ({ event, hasRequested, onDetails, onRequestParticipation }: Props) => {
  const sportGradient = getSportGradient(event.sport);
  const categoryLogo = levelLogos[event.level];

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
        <p className="card-meta">📅 {event.date}</p>
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
