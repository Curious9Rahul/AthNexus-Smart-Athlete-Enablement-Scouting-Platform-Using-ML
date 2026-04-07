import { useState, useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import type { AppEvent } from '@/hooks/useEvents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Shield, Plus, MapPin, Calendar, Clock, Trophy, Users, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LEVEL_FILTERS = ['All', 'District', 'Interclg', 'University', 'State', 'Khelo India', 'National', 'Women'];
const TYPE_FILTERS = ['All', 'Indoor', 'Outdoor'];
const FORMAT_FILTERS = ['All', 'Solo', 'Duo', 'Team'];

const ApprovalBadge = ({ status }: { status: 'PENDING' | 'APPROVED' | 'REJECTED' }) => {
    if (status === 'APPROVED') return <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">✅ Live</span>;
    if (status === 'PENDING') return <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold border border-yellow-500/20">⏳ Under Review</span>;
    if (status === 'REJECTED') return <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-500/20">❌ Rejected</span>;
    return null;
};

const VerifierEventsPage = () => {
    const navigate = useNavigate();
    const { liveEvents, upcomingEvents, pendingEvents, loading, approveEvent, rejectEvent } = useEvents();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedFormat, setSelectedFormat] = useState('All');
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const filterEvents = (list: AppEvent[]) => list.filter(event => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            event.title.toLowerCase().includes(q) ||
            event.sport.toLowerCase().includes(q) ||
            event.venue.toLowerCase().includes(q) ||
            event.city.toLowerCase().includes(q);
        const matchesLevel = selectedLevel === 'All'
            ? true
            : selectedLevel === 'Women'
                ? event.gender === 'Women'
                : event.level === selectedLevel;
        const matchesType = selectedType === 'All' || event.type === selectedType;
        const matchesFormat = selectedFormat === 'All' || event.format === selectedFormat;
        return matchesSearch && matchesLevel && matchesType && matchesFormat;
    });

    const filteredLive = useMemo(() => filterEvents(liveEvents), [liveEvents, searchQuery, selectedLevel, selectedType, selectedFormat]);
    const filteredPending = useMemo(() => filterEvents(pendingEvents), [pendingEvents, searchQuery, selectedLevel, selectedType, selectedFormat]);
    const filteredUpcoming = useMemo(() => filterEvents(upcomingEvents), [upcomingEvents, searchQuery, selectedLevel, selectedType, selectedFormat]);

    const handleApprove = async (id: string) => {
        setIsProcessing(id);
        await approveEvent(id);
        setIsProcessing(null);
    };

    const handleReject = async (id: string) => {
        if (!rejectReason.trim()) return;
        setIsProcessing(id);
        await rejectEvent(id, rejectReason);
        setRejectingId(null);
        setRejectReason('');
        setIsProcessing(null);
    };

    const EventActionBar = ({ event }: { event: AppEvent }) => (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
            <ApprovalBadge status={event.approval_status} />
            <div className="flex-1" />
            {event.approval_status === 'PENDING' && (
                rejectingId === event.id ? (
                    <div className="flex gap-2 items-center">
                        <Input
                            placeholder="Reason..."
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            className="bg-white/5 border-white/10 h-8 text-xs text-white w-40"
                            autoFocus
                        />
                        <Button size="sm" disabled={!rejectReason.trim() || isProcessing === event.id} onClick={() => handleReject(event.id)} className="h-7 bg-red-500 hover:bg-red-600 text-xs px-2">Confirm</Button>
                        <Button size="sm" variant="outline" onClick={() => { setRejectingId(null); setRejectReason(''); }} className="h-7 border-white/10 text-gray-300 hover:bg-white/10 text-xs px-2">Cancel</Button>
                    </div>
                ) : (
                    <>
                        <button
                            disabled={isProcessing === event.id}
                            onClick={() => handleApprove(event.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/20 transition-colors disabled:opacity-50"
                        >
                            <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                            disabled={isProcessing === event.id}
                            onClick={() => setRejectingId(event.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                            <X className="w-3 h-3" /> Reject
                        </button>
                    </>
                )
            )}
            {event.approval_status === 'APPROVED' && (
                <button
                    disabled={isProcessing === event.id}
                    onClick={() => rejectEvent(event.id, 'Revoked by verifier')}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                    <X className="w-3 h-3" /> Revoke
                </button>
            )}
        </div>
    );

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

    const EventCard = ({ event }: { event: AppEvent }) => {
        const now = new Date();
        const deadline = new Date(event.deadline);
        const diffHours = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        const timeText = diffHours < 0 ? 'Registration Closed' : diffDays > 0 ? `Closes in ${diffDays}d ${diffHours % 24}h` : `Closes in ${diffHours}h`;

        return (
            <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5 hover:border-lime-400/30 transition-colors flex flex-col">
                <div className="flex gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10 shrink-0">
                        {event.image_emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base leading-tight mb-1.5 truncate text-white">{event.title}</h3>
                        <div className="flex flex-wrap gap-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getLevelColor(event.level)}`}>{event.level}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/10">{event.type}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/10">{event.format}</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-1.5 text-sm text-gray-400 flex-1 mb-3">
                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-lime-400 shrink-0" /><span className="truncate">{event.venue}, {event.city}</span></div>
                    <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" /><span className="truncate">{new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div>
                    <div className="flex items-center gap-2"><Trophy className="w-3.5 h-3.5 text-yellow-500 shrink-0" /><span className="truncate">{event.prize || 'No Prize'}</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" /><span className="truncate">{timeText}</span></div>
                </div>
                <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center gap-1 text-gray-400"><Users className="w-3 h-3" /> Spots</span>
                        <span className="font-bold text-white font-mono">{event.registered_count} <span className="text-gray-500">/ {event.max_participants}</span></span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-lime-400 rounded-full" style={{ width: `${Math.min(100, (event.registered_count / event.max_participants) * 100)}%` }} />
                    </div>
                </div>
                <EventActionBar event={event} />
            </div>
        );
    };

    const Section = ({ title, emptyMsg, events }: { title: string; emptyMsg: string; events: AppEvent[] }) => (
        <section>
            <h2 className="text-xl font-bold text-white tracking-tight mb-5">{title}</h2>
            {events.length === 0 ? (
                <p className="text-gray-500 text-sm italic py-4">{emptyMsg}</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {events.map(event => <EventCard key={event.id} event={event} />)}
                </div>
            )}
        </section>
    );

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 text-lime-400 mb-2">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm font-black tracking-[0.2em] uppercase">Control Center</span>
                </div>
                <h1 className="text-4xl font-black text-white mb-3">Events Database</h1>
                <p className="text-gray-400 text-lg max-w-2xl">Verify and manage all events submitted by athletes and organizers across the platform.</p>
            </div>

            {/* Filter Card */}
            <div className="bg-[#1e293b] border border-white/10 p-8 rounded-3xl mb-12 relative overflow-hidden shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Search */}
                    <div className="lg:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Search Database</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input 
                                placeholder="Search by title, sport, city..." 
                                className="pl-12 h-14 bg-black/20 border-white/10 text-white rounded-2xl focus:border-lime-400/50 transition-all text-base"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Level */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Level / Category</label>
                        <select 
                            className="w-full h-14 bg-black/20 border border-white/10 text-white rounded-2xl px-4 outline-none focus:border-lime-400/50 transition-all appearance-none cursor-pointer"
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                        >
                            {LEVEL_FILTERS.map(l => <option key={l} value={l} className="bg-[#1e293b]">{l}</option>)}
                        </select>
                    </div>

                    {/* Type & Format Combo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Type</label>
                            <select 
                                className="w-full h-14 bg-black/20 border border-white/10 text-white rounded-2xl px-3 outline-none focus:border-lime-400/50 transition-all appearance-none cursor-pointer text-sm"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                {TYPE_FILTERS.map(t => <option key={t} value={t} className="bg-[#1e293b]">{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Format</label>
                            <select 
                                className="w-full h-14 bg-black/20 border border-white/10 text-white rounded-2xl px-3 outline-none focus:border-lime-400/50 transition-all appearance-none cursor-pointer text-sm"
                                value={selectedFormat}
                                onChange={(e) => setSelectedFormat(e.target.value)}
                            >
                                {FORMAT_FILTERS.map(f => <option key={f} value={f} className="bg-[#1e293b]">{f}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <p className="text-xs text-gray-500 italic">
                        Events revokes will trigger automated email notifications to the organizer.
                    </p>
                    <button
                        onClick={() => navigate('/verifier/create-event')}
                        className="group flex items-center gap-3 px-6 py-3 bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-black rounded-2xl transition-all shadow-xl shadow-lime-400/20 active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        + Create Event
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-72 bg-white/5 rounded-xl border border-white/10 animate-pulse" />)}
                </div>
            ) : (
                <div className="space-y-16">
                    <Section title="⏳ PENDING APPROVAL" emptyMsg="No pending events." events={filteredPending} />
                    <Section title="🟢 LIVE EVENTS" emptyMsg="No live events right now." events={filteredLive} />
                    <Section title="📅 ALL UPCOMING EVENTS" emptyMsg="No upcoming events match your filters." events={filteredUpcoming} />
                </div>
            )}
        </div>
    );
};

export default VerifierEventsPage;

