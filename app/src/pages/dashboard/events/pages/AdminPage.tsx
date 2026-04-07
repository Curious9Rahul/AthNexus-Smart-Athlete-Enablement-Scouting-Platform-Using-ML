import type { Event, ParticipationRequest, ParticipationRequestStatus } from "../types";

type Props = {
  events: Event[];
  participationRequests: ParticipationRequest[];
  onUpdateRequestStatus: (requestId: number, status: ParticipationRequestStatus) => void;
};

const AdminPage = ({ events, participationRequests, onUpdateRequestStatus }: Props) => {
  return (
    <div className="admin-page">
      <section className="admin-shell">
        <p className="hero-kicker">Admin</p>
        <h1>Participation Requests</h1>

        <div className="admin-list">
          {participationRequests.length === 0 ? (
            <p className="empty-state">No participation requests yet.</p>
          ) : (
            participationRequests.map((request) => {
              const event = events.find((item) => item.id === request.eventId);

              return (
                <article key={request.requestId} className="admin-card">
                  <div className="admin-card-head">
                    <p>{request.candidateName}</p>
                    <span className={`status-pill ${request.status.toLowerCase()}`}>{request.status}</span>
                  </div>

                  <p className="admin-meta">Email: {request.candidateEmail}</p>
                  <p className="admin-meta">Event: {event?.name ?? "Unknown Event"}</p>
                  <p className="admin-meta">Level: {event?.level ?? "-"}</p>
                  <p className="admin-meta">Timing: {event?.date ?? "-"} | {event?.time ?? "-"}</p>

                  <div className="admin-actions">
                    <button
                      className="approve-btn"
                      onClick={() => onUpdateRequestStatus(request.requestId, "Approved")}
                      disabled={request.status === "Approved"}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => onUpdateRequestStatus(request.requestId, "Rejected")}
                      disabled={request.status === "Rejected"}
                    >
                      Reject
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminPage;

