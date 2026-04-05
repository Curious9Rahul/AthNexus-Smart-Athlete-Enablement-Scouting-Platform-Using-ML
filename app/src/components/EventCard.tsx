import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import type { AppEvent } from '@/hooks/useEvents';
import { Calendar as CalendarIcon, MapPin, Trophy, Clock, Users, ShieldAlert } from 'lucide-react';
import RegistrationFormModal from '@/components/RegistrationFormModal';

interface EventCardProps {
    event: AppEvent;
    onRegisterSuccess?: () => void;
}

// Module-level cache so we only fetch once per browser session
let _accountStatusCache: string | null = null;

const EventCard = ({ event, onRegisterSuccess }: EventCardProps) => {
    const { user } = useAuth();
    const { refreshEvents } = useEvents();
    const [showModal, setShowModal] = useState(false);
    const [accountStatus, setAccountStatus] = useState<string>(_accountStatusCache ?? 'ACTIVE');

    // Determine existing registration status for current athlete
    const [regStatus, setRegStatus] = useState<string | null>(null);

    // Fetch user account status (ACTIVE / BANNED / FROZEN) from users.json via backend
    useEffect(() => {
        if (user?.role !== 'player' || !user.email) return;
        if (_accountStatusCache !== null) { setAccountStatus(_accountStatusCache); return; }
        fetch('http://localhost:5000/api/admin/users')
            .then(r => r.json())
            .then((users: { email: string; status: string }[]) => {
                const found = users.find(u => u.email === user.email);
                const status = found?.status ?? 'ACTIVE';
                _accountStatusCache = status;
                setAccountStatus(status);
            })
            .catch(() => {}); // silently fail — don't block UI
    }, [user?.email, user?.role]);

    useEffect(() => {
        if (user && user.role === 'player' && event.registrations) {
            // Find current user's registration
            const reg = event.registrations.find((r: any) =>
                (typeof r === 'string' ? r : r.athleteEmail) === user.email
            );
            if (reg) {
                setRegStatus(typeof reg === 'string' ? 'APPROVED' : reg.reg_status);
            } else {
                setRegStatus(null);
            }
        }
    }, [user, event.registrations]);

    const handleRegisterSuccess = async () => {
        setRegStatus('PENDING');
        await refreshEvents();
        if (onRegisterSuccess) onRegisterSuccess();
    };

    const isFull = event.registered_count >= event.max_participants;
    
    // Calculate time left
    const now = new Date();
    const deadline = new Date(event.deadline);
    const diffHours = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    const timeText = diffHours < 0 
        ? "Registration Closed" 
        : diffDays > 0 
            ? `Closes in ${diffDays}d ${diffHours % 24}h` 
            : `Closes in ${diffHours}h`;

    const progressPercent = Math.min(100, (event.registered_count / event.max_participants) * 100);

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'District': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'State': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'National': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'University': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Khelo India': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            default: return 'bg-lime-400/10 text-lime-400 border-lime-400/20';
        }
    };

    const StatusBadge = () => {
        if (diffHours < 0) return null;
        if (event.status === 'LIVE') {
            return (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full z-10 backdrop-blur-md">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </div>
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">LIVE</span>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5 hover:border-lime-400/50 transition-colors flex flex-col h-full relative group">
                <StatusBadge />

                {/* Header */}
                <div className="flex gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex flex-col items-center justify-center text-2xl border border-white/10 shrink-0">
                        {event.image_emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg leading-tight mb-2 pr-12 truncate">{event.title}</h3>
                        <div className="flex flex-wrap gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getLevelColor(event.level)}`}>
                                {event.level}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/10">
                                {event.type}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/10">
                                {event.format}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="max-w-full space-y-2 mb-5 flex-1 pl-1">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4 text-lime-400 shrink-0" />
                        <span className="truncate">{event.venue}, {event.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <CalendarIcon className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="truncate">
                            {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' - '}
                            {new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />
                        <span className="truncate">{event.prize || 'No Prize'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                        <span className={`truncate ${diffHours < 24 && diffHours >= 0 ? "text-orange-400 font-bold" : ""}`}>
                            {timeText}
                        </span>
                    </div>
                </div>

                {/* Progress Bar Container */}
                <div className="mb-5">
                    <div className="flex justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5 font-medium text-gray-300">
                            <Users className="w-3.5 h-3.5" />
                            Spots Taken
                        </div>
                        <span className="font-bold text-white font-mono">{event.registered_count} <span className="text-gray-500">/ {event.max_participants}</span></span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : progressPercent > 80 ? 'bg-orange-500' : 'bg-lime-400'}`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Action Area */}
                {user?.role === 'player' && (
                    <div className="mt-auto">
                        {/* Account restriction check */}
                        {accountStatus === 'BANNED' || accountStatus === 'FROZEN' ? (
                            <div className="w-full py-3 bg-red-500/10 text-red-400 font-black rounded-xl text-center border border-red-500/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
                                <ShieldAlert className="w-4 h-4" />
                                Account Restricted
                            </div>
                        ) : regStatus === 'APPROVED' ? (
                            <div className="w-full py-3 bg-lime-400/10 text-lime-400 font-black rounded-xl text-center border border-lime-400/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
                                ✅ Confirmed
                            </div>
                        ) : regStatus === 'PENDING' ? (
                            <div className="w-full py-3 bg-orange-400/10 text-orange-400 font-black rounded-xl text-center border border-orange-400/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
                                ⏳ Pending Approval
                            </div>
                        ) : regStatus === 'REJECTED' ? (
                            <div className="w-full py-3 bg-red-500/10 text-red-400 font-black rounded-xl text-center border border-red-500/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
                                ❌ Not Selected
                            </div>
                        ) : diffHours < 0 ? (
                            <div className="w-full py-3 bg-white/5 text-gray-500 font-black rounded-xl text-center cursor-not-allowed border border-white/5 text-sm uppercase tracking-wider">
                                Event Ended
                            </div>
                        ) : isFull ? (
                            <button className="w-full py-3 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 font-black rounded-xl transition-all border border-orange-500/20 text-sm uppercase tracking-wider">
                                Join Waitlist
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full py-3 bg-lime-400 text-[#0f172a] hover:bg-lime-500 font-black rounded-xl transition-all shadow-lg shadow-lime-400/10 text-sm uppercase tracking-wider active:scale-95"
                            >
                                Register Now
                            </button>
                        )}
                    </div>
                )}
            </div>

            {showModal && (
                <RegistrationFormModal
                    event={event}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleRegisterSuccess}
                />
            )}
        </>
    );
};

export default EventCard;
