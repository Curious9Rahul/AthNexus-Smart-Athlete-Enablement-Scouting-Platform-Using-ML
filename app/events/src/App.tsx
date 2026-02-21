import { useMemo, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import EventPage from "./pages/EventPage";
import AdminPage from "./pages/AdminPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import { events as initialEvents } from "./data/events";
import type {
  Event,
  NewEventInput,
  ParticipationRequest,
  ParticipationRequestStatus
} from "./types";

const DEMO_CANDIDATE = {
  candidateName: "Demo Athlete",
  candidateEmail: "athlete@demo.com"
};

const App = () => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [participationRequests, setParticipationRequests] = useState<ParticipationRequest[]>([]);

  const pendingRequestCount = useMemo(
    () => participationRequests.filter((request) => request.status === "Pending").length,
    [participationRequests]
  );

  const handleCreateParticipationRequest = (eventId: number) => {
    const alreadyRequested = participationRequests.some(
      (request) =>
        request.eventId === eventId && request.candidateEmail === DEMO_CANDIDATE.candidateEmail
    );

    if (alreadyRequested) {
      return;
    }

    setParticipationRequests((prev) => {
      const nextRequestId = prev.length === 0 ? 1 : Math.max(...prev.map((req) => req.requestId)) + 1;
      const newRequest: ParticipationRequest = {
        requestId: nextRequestId,
        eventId,
        candidateName: DEMO_CANDIDATE.candidateName,
        candidateEmail: DEMO_CANDIDATE.candidateEmail,
        status: "Pending"
      };

      return [...prev, newRequest];
    });
  };

  const handleUpdateRequestStatus = (requestId: number, status: ParticipationRequestStatus) => {
    setParticipationRequests((prev) =>
      prev.map((request) => (request.requestId === requestId ? { ...request, status } : request))
    );
  };

  const handleSuggestEvent = (input: NewEventInput) => {
    setEvents((prev) => {
      const nextId = prev.length === 0 ? 1 : Math.max(...prev.map((event) => event.id)) + 1;
      const newEvent: Event = {
        id: nextId,
        ...input
      };

      return [newEvent, ...prev];
    });
  };

  return (
    <div>
      <header className="top-nav">
        <div className="top-nav-inner">
          <p className="brand">AthNexus</p>
          <nav className="nav-links" aria-label="Main navigation">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} end>
              Events
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Admin ({pendingRequestCount})
            </NavLink>
          </nav>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <EventPage
              events={events}
              participationRequests={participationRequests}
              onRequestParticipation={handleCreateParticipationRequest}
              onSuggestEvent={handleSuggestEvent}
            />
          }
        />
        <Route
          path="/admin"
          element={
            <AdminPage
              events={events}
              participationRequests={participationRequests}
              onUpdateRequestStatus={handleUpdateRequestStatus}
            />
          }
        />
        <Route path="/event/:id" element={<EventDetailsPage events={events} />} />
      </Routes>
    </div>
  );
};

export default App;
