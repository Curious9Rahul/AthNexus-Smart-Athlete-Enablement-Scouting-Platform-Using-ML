import { useState, useMemo, useEffect } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { Calendar, MapPin, Check, Shield, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

const EventApprovalPage = () => {
    const { approveEvent, rejectEvent } = useEvents();
    const [allEvents, setAllEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/events');
            if (response.ok) {
                const data = await response.json();
                setAllEvents(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const pendingEvents = useMemo(() => allEvents.filter(e => e.approval_status === 'PENDING'), [allEvents]);
    const processedEvents = useMemo(() => allEvents.filter(e => e.approval_status !== 'PENDING'), [allEvents]);

    const handleApprove = async (id: string) => {
        setIsProcessing(id);
        const success = await approveEvent(id);
        if (success) {
            toast.success('Event approved and live!');
            fetchEvents();
        }
        setIsProcessing(null);
    };

    const handleReject = async (id: string) => {
        if (!rejectReason.trim()) return;
        setIsProcessing(id);
        const success = await rejectEvent(id, rejectReason);
        if (success) {
            toast.success('Event request rejected.');
            fetchEvents();
        }
        setRejectingId(null);
        setRejectReason('');
        setIsProcessing(null);
    };

    return (
        <div className="pb-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-lime-400 mb-2">
                        <Shield className="w-5 h-5" />
                        <span className="text-sm font-black tracking-[0.2em] uppercase">Verifier Portal</span>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3">Event Request Approval</h1>
                    <p className="text-gray-400 text-lg max-w-2xl">Review and moderate event submissions from the athlete community.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Spinner className="w-10 h-10 text-lime-400" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Loading Submissions...</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* Pending Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="px-3 py-1 bg-orange-400/20 rounded-full border border-orange-400/30">
                                    <span className="text-orange-400 text-xs font-black uppercase tracking-widest">⏳ Pending Review</span>
                                </div>
                                <div className="h-px bg-white/5 flex-1" />
                            </div>

                            {pendingEvents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pendingEvents.map(event => (
                                        <div key={event.id} className="bg-[#1e293b] border border-white/10 rounded-3xl p-6 hover:border-lime-400/30 transition-all flex flex-col shadow-xl group">
                                            <div className="flex items-start gap-4 mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-4xl border border-white/10 group-hover:border-lime-400/20 transition-all">
                                                    {event.image_emoji}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-black text-lg text-white leading-tight mb-2 line-clamp-2">{event.title}</h3>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                                        <UserCircle className="w-3 h-3" />
                                                        {event.created_by}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-8 flex-1">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                                                        <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Sport</p>
                                                        <p className="text-xs font-bold text-gray-300">{event.sport}</p>
                                                    </div>
                                                    <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                                                        <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Level</p>
                                                        <p className="text-xs font-bold text-gray-300">{event.level}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                                                        <MapPin className="w-3 h-3 text-red-400" />
                                                        <span className="truncate">{event.venue}, {event.city}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                                                        <Calendar className="w-3 h-3 text-blue-400" />
                                                        <span>{new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {rejectingId === event.id ? (
                                                    <div className="animate-in fade-in zoom-in-95 duration-200">
                                                        <textarea
                                                            placeholder="Reason for rejection..."
                                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-xs text-white mb-2 focus:outline-none focus:border-red-500/50 min-h-[80px] resize-none"
                                                            value={rejectReason}
                                                            onChange={e => setRejectReason(e.target.value)}
                                                            autoFocus
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black text-[10px] h-9 rounded-xl"
                                                                disabled={isProcessing === event.id || !rejectReason.trim()}
                                                                onClick={() => handleReject(event.id)}
                                                            >
                                                                CONFIRM REJECT
                                                            </Button>
                                                            <Button 
                                                                variant="ghost"
                                                                className="px-4 text-gray-500 hover:text-white text-[10px] font-black"
                                                                onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                                            >
                                                                CANCEL
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            className="flex-1 bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-black text-xs h-12 rounded-2xl shadow-lg active:scale-95 transition-all"
                                                            disabled={isProcessing === event.id}
                                                            onClick={() => handleApprove(event.id)}
                                                        >
                                                            {isProcessing === event.id ? <Spinner className="w-4 h-4" /> : 'APPROVE EVENT'}
                                                        </Button>
                                                        <Button 
                                                            variant="outline"
                                                            className="px-4 border-white/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 font-black text-xs h-12 rounded-2xl active:scale-95 transition-all"
                                                            disabled={isProcessing === event.id}
                                                            onClick={() => setRejectingId(event.id)}
                                                        >
                                                            REJECT
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-12 text-center">
                                    <div className="w-16 h-16 bg-lime-400/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-lime-400/30">
                                        <Check className="w-8 h-8 text-lime-400" />
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-1">No Pending Requests</h3>
                                    <p className="text-gray-500 font-medium">All community submitted events have been reviewed.</p>
                                </div>
                            )}
                        </section>

                        {/* Processed Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                    <span className="text-gray-500 text-xs font-black uppercase tracking-widest">✅ Decision History</span>
                                </div>
                                <div className="h-px bg-white/5 flex-1" />
                            </div>

                            <div className="bg-[#1e293b] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-black/20 border-b border-white/5">
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Event Detail</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Submitted By</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Outcome</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {processedEvents.length > 0 ? processedEvents.map(event => (
                                                <tr key={event.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">{event.image_emoji}</span>
                                                            <div>
                                                                <p className="text-sm font-bold text-white leading-none mb-1">{event.title}</p>
                                                                <p className="text-[10px] text-gray-500 font-medium">{event.sport} • {event.level}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <p className="text-xs font-bold text-blue-400/80">{event.created_by}</p>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                            event.approval_status === 'APPROVED' ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20' : 'bg-red-400/10 text-red-400 border border-red-400/20'
                                                        }`}>
                                                            {event.approval_status}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <p className="text-xs font-bold text-gray-500">{new Date(event.created_at || Date.now()).toLocaleDateString()}</p>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium italic">
                                                        No decision history found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventApprovalPage;

