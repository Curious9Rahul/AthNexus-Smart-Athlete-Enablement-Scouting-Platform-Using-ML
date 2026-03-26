import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { Calendar, MapPin, Trophy, Inbox, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const MyEventsPage = () => {
    const { user } = useAuth();
    const { events, loading, cancelRegistration, refreshEvents } = useEvents();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'registrations' | 'created'>('registrations');
    const [isCancelling, setIsCancelling] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const userEmail = user?.email || '';

    // Data filtering
    const registeredEvents = useMemo(() => {
        if (!userEmail) return [];
        return events.filter(e => {
            if (!e.registrations) return false;
            return e.registrations.some((r: any) => 
                (typeof r === 'string' ? r : r.athleteEmail) === userEmail
            );
        });
    }, [events, userEmail]);

    const createdEvents = useMemo(() => {
        if (!userEmail) return [];
        return events.filter(e => e.created_by === userEmail);
    }, [events, userEmail]);

    const handleCancel = async (eventId: string) => {
        if (!confirm('Are you sure you want to cancel your registration?')) return;
        setIsCancelling(eventId);
        await cancelRegistration(eventId, userEmail);
        setIsCancelling(null);
    };

    const handleDelete = async (eventId: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        setIsDeleting(eventId);
        try {
            const res = await fetch(`http://localhost:5000/api/events/${eventId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            toast.success('Event deleted.');
            await refreshEvents();
        } catch {
            toast.error('Failed to delete event.');
        }
        setIsDeleting(null);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        if (status === 'APPROVED') {
            return <div className="px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 text-[10px] font-black border border-lime-400/20 uppercase tracking-wider">✅ Confirmed</div>;
        }
        if (status === 'PENDING') {
            return <div className="px-3 py-1 rounded-full bg-orange-400/10 text-orange-400 text-[10px] font-black border border-orange-400/20 uppercase tracking-wider">⏳ Awaiting Approval</div>;
        }
        if (status === 'REJECTED') {
            return <div className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black border border-red-500/20 uppercase tracking-wider">❌ Not Selected</div>;
        }
        return null;
    };

    const CreatorBadge = ({ status }: { status: string }) => {
        if (status === 'APPROVED') {
            return <div className="px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 text-[10px] font-black border border-lime-400/20 uppercase tracking-wider">✅ Live on Platform</div>;
        }
        if (status === 'PENDING') {
            return <div className="px-3 py-1 rounded-full bg-orange-400/10 text-orange-400 text-[10px] font-black border border-orange-400/20 uppercase tracking-wider">⏳ Under Review</div>;
        }
        if (status === 'REJECTED') {
            return <div className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black border border-red-500/20 uppercase tracking-wider">❌ Rejected</div>;
        }
        return null;
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-lime-400 mb-2">
                    <Trophy className="w-5 h-5" />
                    <span className="text-sm font-semibold tracking-wider uppercase">My Events</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">My Portal</h1>
                <p className="text-gray-400">Track your event registrations and manage the events you've created.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('registrations')}
                    className={`pb-4 px-2 font-bold text-sm tracking-wide transition-colors relative ${
                        activeTab === 'registrations' ? 'text-lime-400' : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                    MY REGISTRATIONS ({registeredEvents.length})
                    {activeTab === 'registrations' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('created')}
                    className={`pb-4 px-2 font-bold text-sm tracking-wide transition-colors relative ${
                        activeTab === 'created' ? 'text-lime-400' : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                    EVENTS I CREATED ({createdEvents.length})
                    {activeTab === 'created' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400 rounded-t-full" />
                    )}
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-white/5 rounded-xl border border-white/10 animate-pulse" />
                    ))}
                </div>
            ) : activeTab === 'registrations' ? (
                // TAB 1: REGISTRATIONS
                registeredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {registeredEvents.map(event => {
                            const reg = event.registrations?.find((r: any) => 
                                (typeof r === 'string' ? r : r.athleteEmail) === userEmail
                            );
                            const regStatus = reg ? (typeof reg === 'string' ? 'APPROVED' : reg.reg_status) : 'PENDING';

                            return (
                                <div key={event.id} className="bg-[#1e293b] border border-white/10 rounded-xl p-5 flex flex-col md:flex-row gap-5 hover:border-white/20 transition-all">
                                    <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-3xl shrink-0">
                                        {event.image_emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2 gap-4">
                                            <h3 className="font-bold text-lg text-white truncate">{event.title}</h3>
                                            <StatusBadge status={regStatus} />
                                        </div>
                                        <div className="space-y-1 mb-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                                                <span className="truncate">{new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-lime-400 shrink-0" />
                                                <span className="truncate">{event.venue}, {event.city}</span>
                                            </div>
                                        </div>
                                        {regStatus === 'PENDING' && (
                                            <button 
                                                onClick={() => handleCancel(event.id)}
                                                disabled={isCancelling === event.id}
                                                className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider"
                                            >
                                                {isCancelling === event.id ? 'Cancelling...' : 'Cancel Registration'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <Inbox className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Registrations Yet</h3>
                        <p className="text-gray-400">You haven't registered for any events. Head over to Discovery to find upcoming tournaments.</p>
                    </div>
                )
            ) : (
                // TAB 2: CREATED EVENTS
                createdEvents.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {createdEvents.map(event => (
                            <div key={event.id} className="bg-[#1e293b] border border-white/10 rounded-xl p-5 flex flex-col md:flex-row gap-5 hover:border-white/20 transition-all">
                                <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-3xl shrink-0">
                                    {event.image_emoji}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2 gap-4">
                                            <h3 className="font-bold text-lg text-white truncate">{event.title}</h3>
                                            <CreatorBadge status={event.approval_status} />
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                                            <span className="truncate">{new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        {event.approval_status === 'PENDING' && (
                                            <button
                                                onClick={() => navigate(`/dashboard/create-event?edit=${event.id}`)}
                                                className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
                                            >
                                                <Edit className="w-3.5 h-3.5" /> Edit
                                            </button>
                                        )}
                                        {event.approval_status !== 'APPROVED' && (
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                disabled={isDeleting === event.id}
                                                className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 disabled:opacity-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> {isDeleting === event.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <Inbox className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Events Created</h3>
                        <p className="text-gray-400">You haven't created any events. Did you know you can organize your own tournaments?</p>
                    </div>
                )
            )}
        </div>
    );
};

export default MyEventsPage;
