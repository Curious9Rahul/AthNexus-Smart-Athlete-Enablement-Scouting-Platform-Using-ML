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

const EventCard = ({ event, hasRequested, onDetails, onRequestParticipation }: Props) => {
  const sportGradient = getSportGradient();
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
            <span>{event.date}</span>
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
