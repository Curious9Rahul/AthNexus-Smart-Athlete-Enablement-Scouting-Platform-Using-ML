import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserCircle, Check, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEvents } from '@/hooks/useEvents';
import { Spinner } from '@/components/ui/spinner';

interface RegistrationRecord {
    eventId: string;
    eventTitle: string;
    athleteId: string | number;
    athleteName: string;
    athleteEmail: string;
    registeredAt: string;
    reg_status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reject_reason?: string;
}

const RegistrationApprovalPage = () => {
    const { approveRegistration, rejectRegistration } = useEvents();
    const [allRegs, setAllRegs] = useState<RegistrationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectingKey, setRejectingKey] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const fetchAllRegistrations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/events');
            if (response.ok) {
                const events = await response.json();
                const flattened: RegistrationRecord[] = [];
                events.forEach((evt: any) => {
                    if (evt.registrations && Array.isArray(evt.registrations)) {
                        evt.registrations.forEach((reg: any) => {
                            flattened.push({
                                eventId: evt.id,
                                eventTitle: evt.title,
                                athleteId: reg.athleteId,
                                athleteName: reg.athleteName,
                                athleteEmail: reg.athleteEmail,
                                registeredAt: reg.registeredAt,
                                reg_status: reg.reg_status || 'APPROVED',
                                reject_reason: reg.reject_reason
                            });
                        });
                    }
                });
                // Sort by date descending
                setAllRegs(flattened.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()));
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load registrations');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllRegistrations();
    }, [fetchAllRegistrations]);

    const pendingRegs = useMemo(() => allRegs.filter(r => r.reg_status === 'PENDING'), [allRegs]);
    const processedRegs = useMemo(() => allRegs.filter(r => r.reg_status !== 'PENDING'), [allRegs]);

    const handleApprove = async (eventId: string, athleteId: string | number) => {
        const key = `${eventId}-${athleteId}`;
        setIsProcessing(key);
        const success = await approveRegistration(eventId, athleteId);
        if (success) {
            toast.success('Registration approved!');
            fetchAllRegistrations();
        }
        setIsProcessing(null);
    };

    const handleReject = async (eventId: string, athleteId: string | number) => {
        if (!rejectReason.trim()) return;
        const key = `${eventId}-${athleteId}`;
        setIsProcessing(key);
        const success = await rejectRegistration(eventId, athleteId, rejectReason);
        if (success) {
            toast.success('Registration rejected.');
            fetchAllRegistrations();
        }
        setRejectingKey(null);
        setRejectReason('');
        setIsProcessing(null);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6 pt-24 pb-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-lime-400 mb-2">
                        <Shield className="w-5 h-5" />
                        <span className="text-sm font-black tracking-[0.2em] uppercase">Operations</span>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3">Registration Approval</h1>
                    <p className="text-gray-400 text-lg max-w-2xl">Review and approve athlete registrations for all active tournaments.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Spinner className="w-10 h-10 text-lime-400" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Synchronizing Database...</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* Pending Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="px-3 py-1 bg-orange-400/20 rounded-full border border-orange-400/30">
                                    <span className="text-orange-400 text-xs font-black uppercase tracking-widest">⏳ Pending Approval</span>
                                </div>
                                <div className="h-px bg-white/5 flex-1" />
                            </div>

                            {pendingRegs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pendingRegs.map(reg => {
                                        const key = `${reg.eventId}-${reg.athleteId}`;
                                        return (
                                            <div key={key} className="bg-[#1e293b] border border-white/10 rounded-3xl p-6 hover:border-lime-400/30 transition-all flex flex-col group shadow-xl">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-lime-400/10 group-hover:border-lime-400/20 transition-all">
                                                        <UserCircle className="w-7 h-7 text-gray-400 group-hover:text-lime-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-black text-lg text-white truncate leading-none mb-1">{reg.athleteName}</h3>
                                                        <p className="text-xs text-gray-500 font-medium truncate">{reg.athleteEmail}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-black/40 rounded-2xl p-4 border border-white/5 mb-6 flex-1">
                                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1.5">Requesting For</p>
                                                    <h4 className="font-bold text-lime-400 text-sm line-clamp-2 mb-3">{reg.eventTitle}</h4>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-tighter">
                                                        <Clock className="w-3 h-3" />
                                                        Submission: {new Date(reg.registeredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    {rejectingKey === key ? (
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
                                                                    disabled={isProcessing === key || !rejectReason.trim()}
                                                                    onClick={() => handleReject(reg.eventId, reg.athleteId)}
                                                                >
                                                                    CONFIRM REJECT
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost"
                                                                    className="px-4 text-gray-500 hover:text-white text-[10px] font-black"
                                                                    onClick={() => { setRejectingKey(null); setRejectReason(''); }}
                                                                >
                                                                    CANCEL
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                className="flex-1 bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-black text-xs h-12 rounded-2xl shadow-lg shadow-lime-400/10 active:scale-95"
                                                                disabled={isProcessing === key}
                                                                onClick={() => handleApprove(reg.eventId, reg.athleteId)}
                                                            >
                                                                {isProcessing === key ? <Spinner className="w-4 h-4" /> : 'APPROVE'}
                                                            </Button>
                                                            <Button 
                                                                variant="outline"
                                                                className="border-white/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 font-black text-xs h-12 rounded-2xl active:scale-95"
                                                                disabled={isProcessing === key}
                                                                onClick={() => setRejectingKey(key)}
                                                            >
                                                                REJECT
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-12 text-center">
                                    <div className="w-16 h-16 bg-lime-400/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-lime-400/30">
                                        <Check className="w-8 h-8 text-lime-400" />
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-1">Queue is Clear</h3>
                                    <p className="text-gray-500 font-medium">No athletes are currently waiting for approval.</p>
                                </div>
                            )}
                        </section>

                        {/* Processed Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                    <span className="text-gray-500 text-xs font-black uppercase tracking-widest">✅ Processed Registrations</span>
                                </div>
                                <div className="h-px bg-white/5 flex-1" />
                            </div>

                            <div className="bg-[#1e293b] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-black/20 border-b border-white/5">
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Athlete</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Event</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Processed On</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {processedRegs.length > 0 ? processedRegs.map(reg => (
                                                <tr key={`${reg.eventId}-${reg.athleteId}`} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                                                <UserCircle className="w-4 h-4 text-gray-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white leading-none mb-1">{reg.athleteName}</p>
                                                                <p className="text-[10px] text-gray-500 font-medium truncate max-w-[150px]">{reg.athleteEmail}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <p className="text-sm font-medium text-gray-300 line-clamp-1">{reg.eventTitle}</p>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                            reg.reg_status === 'APPROVED' ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20' : 'bg-red-400/10 text-red-400 border border-red-400/20'
                                                        }`}>
                                                            {reg.reg_status}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <p className="text-xs font-bold text-gray-500">{new Date(reg.registeredAt).toLocaleDateString()}</p>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium italic">
                                                        No processed registrations found in history.
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

export default RegistrationApprovalPage;
