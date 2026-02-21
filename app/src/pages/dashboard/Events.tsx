import { useMemo, useState } from 'react';
import EventPage from './events/pages/EventPage';
import AdminPage from './events/pages/AdminPage';
import EventDetailsPage from './events/pages/EventDetailsPage';
import { events as initialEvents } from './events/data/events';
import './events/events.css'; // This will need scoping fix
import type {
    Event,
    NewEventInput,
    ParticipationRequest,
    ParticipationRequestStatus
} from './events/types';

const DEMO_CANDIDATE = {
    candidateName: "Demo Athlete",
    candidateEmail: "athlete@demo.com"
};

type SubView = 'list' | 'admin' | 'details';

const Events = () => {
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const [participationRequests, setParticipationRequests] = useState<ParticipationRequest[]>([]);
    const [activeSubView, setActiveSubView] = useState<SubView>('list');
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

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

    const navigateToDetails = (eventId: number) => {
        setSelectedEventId(eventId);
        setActiveSubView('details');
    };

    const renderSubView = () => {
        switch (activeSubView) {
            case 'list':
                return (
                    <EventPage
                        events={events}
                        participationRequests={participationRequests}
                        onRequestParticipation={handleCreateParticipationRequest}
                        onSuggestEvent={handleSuggestEvent}
                        onDetails={navigateToDetails}
                    />
                );
            case 'admin':
                return (
                    <AdminPage
                        events={events}
                        participationRequests={participationRequests}
                        onUpdateRequestStatus={handleUpdateRequestStatus}
                    />
                );
            case 'details':
                return selectedEventId ? (
                    <EventDetailsPage
                        event={events.find(e => e.id === selectedEventId)!}
                        onBack={() => setActiveSubView('list')}
                    />
                ) : (
                    <div className="text-white">Event not found</div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="athnexus-events-container">
            {/* Local Nav */}
            <div className="flex gap-4 mb-6 sticky top-0 z-10 bg-[#0f172a] py-2">
                <button
                    onClick={() => setActiveSubView('list')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeSubView === 'list'
                        ? 'bg-lime-400 text-[#0f172a]'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                >
                    All Events
                </button>
                <button
                    onClick={() => setActiveSubView('admin')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeSubView === 'admin'
                        ? 'bg-lime-400 text-[#0f172a]'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                >
                    Admin {pendingRequestCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {pendingRequestCount}
                        </span>
                    )}
                </button>
            </div>

            <div className="athnexus-events-module">
                {renderSubView()}
            </div>
        </div>
    );
};

export default Events;
