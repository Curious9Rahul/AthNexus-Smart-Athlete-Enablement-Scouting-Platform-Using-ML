import { useState, useMemo, useEffect } from 'react';
import { Shield, Plus, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAthletes } from '@/hooks/useAthletes';
import type { Athlete } from '@/hooks/useAthletes';
import { useEvents } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/spinner';

export default function EmailAlertsPage() {
    const { user } = useAuth();
    const { athletes } = useAthletes();
    const { events } = useEvents();

    const [recipientType, setRecipientType] = useState('ALL');
    const [selectedSport, setSelectedSport] = useState('ALL');
    const [selectedLevel, setSelectedLevel] = useState('ALL');
    
    // Auto-complete search state
    const [searchName, setSearchName] = useState('');
    const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
    
    const [customEmail, setCustomEmail] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Event Selection State
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [eventSearch, setEventSearch] = useState('');
    const [isSendingDeadline, setIsSendingDeadline] = useState(false);
    const [isSendingUpcoming, setIsSendingUpcoming] = useState(false);

    const uniqueSports = Array.from(new Set(athletes.map(a => a.sport)));
    const uniqueLevels = Array.from(new Set(athletes.map(a => a.competitionLevel)));

    const approvedEvents = useMemo(() => events.filter(e => e.approval_status === 'APPROVED'), [events]);

    const filteredEventsList = useMemo(() => {
        let filtered = approvedEvents;
        if (eventSearch.trim()) {
            const q = eventSearch.toLowerCase();
            filtered = filtered.filter(e => 
                e.title.toLowerCase().includes(q) || 
                e.sport.toLowerCase().includes(q) || 
                e.level.toLowerCase().includes(q)
            );
        }
        return filtered;
    }, [approvedEvents, eventSearch]);

    useEffect(() => {
        if (!selectedEventId && approvedEvents.length > 0) {
            setSelectedEventId(approvedEvents[0].id);
        }
    }, [approvedEvents, selectedEventId]);

    const selectedEvent = useMemo(() => {
        return approvedEvents.find(e => e.id === selectedEventId) || approvedEvents[0];
    }, [selectedEventId, approvedEvents]);

    const filteredRecipients: (Athlete | { email: string; name: string })[] = useMemo(() => {
        if (recipientType === 'CUSTOM') {
            if (!customEmail.trim()) return [];
            return [{ email: customEmail, name: 'Athlete' }];
        }
        if (recipientType === 'ALL') return athletes;
        if (recipientType === 'SPORT') {
            return athletes.filter((a: Athlete) => selectedSport === 'ALL' || a.sport === selectedSport);
        }
        if (recipientType === 'LEVEL') {
            return athletes.filter((a: Athlete) => selectedLevel === 'ALL' || a.competitionLevel === selectedLevel);
        }
        if (recipientType === 'SINGLE') {
            if (!selectedAthlete) return [];
            return [selectedAthlete];
        }
        return athletes;
    }, [athletes, recipientType, selectedSport, selectedLevel, selectedAthlete, customEmail]);

    const handleSend = async () => {
        if (recipientType === 'CUSTOM') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!customEmail.trim() || !emailRegex.test(customEmail)) {
                toast.error("Please enter a valid email address.");
                return;
            }
        } else if (recipientType === 'SINGLE' && !selectedAthlete) {
            toast.error("Please select an athlete.");
            return;
        }

        if (filteredRecipients.length === 0) {
            toast.error("No recipients found for the selected criteria.");
            return;
        }

        if (!selectedEvent) {
            toast.error("No tournament selected.");
            return;
        }

        setIsSending(true);

        const recipientsList = filteredRecipients.map(a => ({ email: a.email, name: a.name }));
        const subject = `Tournament Alert: ${selectedEvent.title}`;
        
        // Match the requested layout and use br tags for line breaks
        const messageHtml = `You are invited to ${selectedEvent.title}.<br/>
Sport: ${selectedEvent.sport} | Level: ${selectedEvent.level}<br/>
Venue: ${selectedEvent.venue}, ${selectedEvent.city}<br/>
Dates: ${new Date(selectedEvent.start_date).toLocaleDateString()} to ${new Date(selectedEvent.end_date).toLocaleDateString()}<br/>
Deadline: ${new Date(selectedEvent.deadline).toLocaleDateString()}<br/>
Prize: ${selectedEvent.prize}<br/><br/>
Login to AthNexus to register!`;

        try {
            const response = await fetch('http://localhost:5000/api/send-bulk-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients: recipientsList,
                    subject,
                    eventId: selectedEvent.id,
                    message: messageHtml
                })
            });

            const data = await response.json();

            if (data.sent !== undefined) {
                toast.success("Tournament alert sent!");
                setRecipientType('ALL');
                setSelectedAthlete(null);
                setSearchName('');
                setCustomEmail('');
            } else {
                toast.error("Failed to send tournament alerts.");
            }
        } catch (error) {
            console.error("Error sending bulk custom email:", error);
            toast.error("Network error while sending emails.");
        } finally {
            setIsSending(false);
        }
    };

    const sendReminder = async (type: 'deadline' | 'upcoming') => {
        if (!selectedEvent) { toast.error('Please select an event first.'); return; }
        const setter = type === 'deadline' ? setIsSendingDeadline : setIsSendingUpcoming;
        setter(true);
        try {
            const res = await fetch(`http://localhost:5000/api/emails/${type}-reminder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: selectedEvent.id })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(type === 'deadline' ? `Deadline reminder sent to ${data.sent} recipient(s)!` : `Upcoming reminder sent to ${data.sent} athlete(s)!`);
            } else {
                toast.error('Failed to send reminder.');
            }
        } catch {
            toast.error('Network error while sending reminder.');
        } finally {
            setter(false);
        }
    };

    const recipientCount = filteredRecipients.length;

    if (!user || (user.role !== 'verifier' && user.role !== 'admin')) {
        return <div className="p-20 text-center text-white">Unauthorized</div>;
    }

    return (
        <div className="pb-20">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                        <Shield className="w-5 h-5" />
                        <span className="text-sm font-black tracking-[0.2em] uppercase">VERIFIER PORTAL</span>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3">Athlete Verifications</h1>
                    <p className="text-gray-400 text-lg max-w-2xl">Review and manage athlete profiles and documents.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT SIDE: Compose Alert */}
                    <div id="email-compose" className="bg-[#1e293b] rounded-3xl p-8 border border-white/10 shadow-2xl flex-1 max-w-2xl">
                        <h2 className="text-xl font-black flex items-center gap-3 mb-8 text-white">
                            <Plus className="w-6 h-6 text-lime-400" />
                            Compose New Alert
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Recipient Segment</label>
                                <select
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-lime-400/50 transition-all appearance-none cursor-pointer font-bold"
                                    value={recipientType}
                                    onChange={(e) => {
                                        setRecipientType(e.target.value);
                                        setSelectedAthlete(null);
                                        setSearchName('');
                                    }}
                                >
                                    <option className="bg-[#1e293b]" value="ALL">All Athletes</option>
                                    <option className="bg-[#1e293b]" value="CUSTOM">Specific Email Address</option>
                                    <option className="bg-[#1e293b]" value="SPORT">Athletes in specific Sport</option>
                                    <option className="bg-[#1e293b]" value="LEVEL">Athletes in specific Level</option>
                                    <option className="bg-[#1e293b]" value="SINGLE">Single Athlete (search by name)</option>
                                </select>
                            </div>

                            {recipientType === 'CUSTOM' && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Enter email address *</label>
                                        <input
                                            type="email"
                                            placeholder="recipient@example.com"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400/50 transition-all font-medium"
                                            value={customEmail}
                                            onChange={(e) => setCustomEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {recipientType === 'SPORT' && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Select Sport</label>
                                    <select
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-lime-400/50 transition-all"
                                        value={selectedSport}
                                        onChange={(e) => setSelectedSport(e.target.value)}
                                    >
                                        <option className="bg-[#1e293b]" value="ALL">All Sports</option>
                                        {uniqueSports.filter(s => s).map(s => (
                                            <option className="bg-[#1e293b]" key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {recipientType === 'LEVEL' && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Select Level</label>
                                    <select
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-lime-400/50 transition-all"
                                        value={selectedLevel}
                                        onChange={(e) => setSelectedLevel(e.target.value)}
                                    >
                                        <option className="bg-[#1e293b]" value="ALL">All Levels</option>
                                        {uniqueLevels.filter(l => l).map(l => (
                                            <option className="bg-[#1e293b]" key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {recipientType === 'SINGLE' && (
                                <div className="animate-in fade-in slide-in-from-top-2 relative">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Search Athlete</label>
                                    
                                    {selectedAthlete ? (
                                        <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="font-bold text-white">{selectedAthlete.name}</div>
                                                <div className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded uppercase tracking-wider font-bold">
                                                    {selectedAthlete.sport}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedAthlete(null)}
                                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                            >
                                                <X className="w-4 h-4 text-gray-400 hover:text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Type name to search..."
                                                    className="w-full bg-black/20 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-white focus:outline-none focus:border-lime-400/50 transition-all"
                                                    value={searchName}
                                                    onChange={(e) => setSearchName(e.target.value)}
                                                />
                                            </div>
                                            
                                            {searchName.trim().length > 0 && (
                                                <div className="absolute top-[80px] left-0 right-0 bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-20 max-h-60 overflow-y-auto custom-scrollbar">
                                                    {athletes.filter(a => a.name.toLowerCase().includes(searchName.toLowerCase())).map(athlete => (
                                                        <div 
                                                            key={athlete.id}
                                                            onClick={() => {
                                                                setSelectedAthlete(athlete);
                                                                setSearchName('');
                                                            }}
                                                            className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                                                        >
                                                            <div className="font-bold text-white">{athlete.name}</div>
                                                            <div className="text-[10px] bg-black/40 text-gray-400 px-2 py-1 rounded uppercase tracking-wider font-bold">
                                                                {athlete.sport}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {athletes.filter(a => a.name.toLowerCase().includes(searchName.toLowerCase())).length === 0 && (
                                                        <div className="p-4 text-sm text-gray-500 text-center font-medium">No athletes found</div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Recipients</span>
                                    <span className="text-lime-400 font-black">{recipientCount}</span>
                                </div>
                                <p className="text-gray-400 text-xs italic">
                                    {recipientType === 'ALL' && "This email will be sent to " + recipientCount + " athletes."}
                                    {recipientType === 'SPORT' && "This email will be sent to " + recipientCount + " athletes in " + (selectedSport === 'ALL' ? 'all sports' : selectedSport) + "."}
                                    {recipientType === 'LEVEL' && "This email will be sent to " + recipientCount + " athletes in " + (selectedLevel === 'ALL' ? 'all levels' : selectedLevel) + "."}
                                    {recipientType === 'SINGLE' && selectedAthlete ? `This email will be sent to ${selectedAthlete.name} (${selectedAthlete.email}).` : recipientType === 'SINGLE' ? 'This email will be sent to 0 athletes.' : ''}
                                    {recipientType === 'CUSTOM' && "This email will be sent to 1 recipient (direct)."}
                                </p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Tournament</label>
                                <div className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-4 text-gray-300 font-bold truncate">
                                    {selectedEvent ? selectedEvent.title : 'No tournament available'}
                                </div>
                            </div>

                            <div className="flex justify-start pt-4">
                                <Button
                                    onClick={handleSend}
                                    disabled={isSending || recipientCount === 0 || !selectedEvent}
                                    className="bg-[#1a2a3a] hover:bg-[#2a3a4a] text-white px-12 h-16 rounded-2xl font-black w-full transition-all disabled:opacity-50 shadow-xl"
                                >
                                    {isSending ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Spinner className="w-5 h-5 text-white" /> SENDING ALERTS...
                                        </span>
                                    ) : (
                                        "Send Tournament Alert"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Event Selection */}
                    <div className="flex-1 flex flex-col gap-6 max-w-sm">
                        <div className="bg-[#1e293b] rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col gap-4 max-h-[800px]">
                            <h2 className="text-lg font-black text-white shrink-0">Event Email Notifications</h2>
                            
                            <div className="relative shrink-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-lime-400/50 transition-all font-medium text-sm"
                                    value={eventSearch}
                                    onChange={(e) => setEventSearch(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                                {filteredEventsList.map(event => {
                                    const isSelected = selectedEventId === event.id;
                                    const deadlineDate = new Date(event.deadline);
                                    const now = new Date();
                                    const deadlineHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                                    const isClosingSoon = deadlineHours > 0 && deadlineHours <= 72;
                                    
                                    return (
                                        <div 
                                            key={event.id}
                                            onClick={() => setSelectedEventId(event.id)}
                                            className={`p-4 rounded-xl cursor-pointer border transition-all ${
                                                isSelected 
                                                    ? 'bg-[#064e3b]/40 border-lime-400/80 shadow-[0_0_15px_rgba(132,204,22,0.15)]' 
                                                    : 'bg-[#0f172a] border-white/5 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="font-bold text-white mb-2 leading-tight">{event.title}</div>
                                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                                                <span className="text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                                                    [{event.sport}]
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-wider bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded">
                                                    [{event.level}]
                                                </span>
                                                {isClosingSoon && (
                                                    <span className="text-[9px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded">
                                                        [CLOSING SOON]
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400 font-medium">
                                                {event.registered_count} registered
                                            </div>
                                        </div>
                                    )
                                })}
                                {filteredEventsList.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 text-sm">No events found matching criteria.</div>
                                )}
                            </div>

                            {/* ─ Quick Reminders ─ */}
                            {selectedEvent && (
                                <div className="shrink-0 border-t border-white/10 pt-4 space-y-3">
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Quick Reminders</p>
                                    <p className="text-[11px] text-gray-600">(for selected: <span className="text-gray-400 font-bold">{selectedEvent.title}</span>)</p>
                                    <button
                                        id="btn-deadline-reminder"
                                        onClick={() => sendReminder('deadline')}
                                        disabled={isSendingDeadline}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-xl text-sm font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSendingDeadline ? '⏳ Sending...' : '⏰ Send Deadline Reminder'}
                                    </button>
                                    <button
                                        id="btn-upcoming-reminder"
                                        onClick={() => sendReminder('upcoming')}
                                        disabled={isSendingUpcoming}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-xl text-sm font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSendingUpcoming ? '⏳ Sending...' : '📅 Send Upcoming Reminder'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

