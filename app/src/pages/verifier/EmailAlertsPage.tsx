import { useState, useMemo } from 'react';
import { Mail, Shield, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAthletes } from '@/hooks/useAthletes';
import type { Athlete } from '@/hooks/useAthletes';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/spinner';

export default function EmailAlertsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { athletes } = useAthletes();

    const [recipientType, setRecipientType] = useState('ALL');
    const [selectedSport, setSelectedSport] = useState('ALL');
    const [selectedLevel, setSelectedLevel] = useState('ALL');
    const [searchName, setSearchName] = useState('');
    const [customEmail, setCustomEmail] = useState('');

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const uniqueSports = Array.from(new Set(athletes.map(a => a.sport)));
    const uniqueLevels = Array.from(new Set(athletes.map(a => a.competitionLevel)));

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
            if (!searchName.trim()) return [];
            return athletes.filter((a: Athlete) => a.name.toLowerCase().includes(searchName.toLowerCase()));
        }
        return athletes;
    }, [athletes, recipientType, selectedSport, selectedLevel, searchName, customEmail]);

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            toast.error("Subject and message are required.");
            return;
        }

        if (recipientType === 'CUSTOM') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!customEmail.trim() || !emailRegex.test(customEmail)) {
                toast.error("Please enter a valid email address.");
                return;
            }
        }

        if (filteredRecipients.length === 0) {
            toast.error("No recipients found for the selected criteria.");
            return;
        }

        setIsSending(true);

        const recipientsList = filteredRecipients.map(a => ({ email: a.email, name: a.name }));

        try {
            const response = await fetch('http://localhost:5000/api/send-bulk-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients: recipientsList,
                    subject,
                    message
                })
            });

            const data = await response.json();

            if (data.sent !== undefined) {
                toast.success(`✅ Email sent to ${data.sent} recipients!`);
                setSubject('');
                setMessage('');
                setRecipientType('ALL');
            } else {
                toast.error("Failed to send emails.");
            }
        } catch (error) {
            console.error("Error sending bulk custom email:", error);
            toast.error("Network error while sending emails.");
        } finally {
            setIsSending(false);
        }
    };

    const recipientCount = filteredRecipients.length;

    if (!user || (user.role !== 'verifier' && user.role !== 'admin')) {
        return <div className="p-20 text-center text-white">Unauthorized</div>;
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6 pt-24 pb-20">
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
                    <div id="email-compose" className="bg-[#1e293b] rounded-3xl p-8 border border-white/10 shadow-2xl flex-1 max-w-3xl">
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
                                    onChange={(e) => setRecipientType(e.target.value)}
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
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Search Athlete</label>
                                    <input
                                        type="text"
                                        placeholder="Enter registered athlete name..."
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-lime-400/50 transition-all"
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Subject Line *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Action Required: Complete Your Registration"
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-lime-400/50 transition-all font-bold"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Alert Content *</label>
                                <textarea
                                    placeholder="Write your email content here..."
                                    rows={8}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-lime-400/50 transition-all"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Recipients</span>
                                    <span className="text-lime-400 font-black">{recipientCount}</span>
                                </div>
                                <p className="text-gray-400 text-xs italic">
                                    {recipientType === 'ALL' && "This email will be sent to " + recipientCount + " athletes."}
                                    {recipientType === 'SPORT' && "This email will be sent to " + recipientCount + " athletes in " + (selectedSport === 'ALL' ? 'all sports' : selectedSport) + "."}
                                    {recipientType === 'LEVEL' && "This email will be sent to " + recipientCount + " athletes in " + (selectedLevel === 'ALL' ? 'all levels' : selectedLevel) + "."}
                                    {recipientType === 'SINGLE' && "This email will be sent to 1 athlete."}
                                    {recipientType === 'CUSTOM' && "This email will be sent to 1 recipient (direct)."}
                                </p>
                            </div>

                            <div className="flex justify-start pt-4">
                                <Button
                                    onClick={handleSend}
                                    disabled={isSending || recipientCount === 0 || !subject.trim() || !message.trim()}
                                    className="bg-lime-400 hover:bg-lime-500 text-[#0f172a] px-12 h-16 rounded-2xl font-black transition-all disabled:opacity-50 min-w-[200px] shadow-xl shadow-lime-400/20 active:scale-95"
                                >
                                    {isSending ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Spinner className="w-5 h-5 text-[#0f172a]" /> BLASTING...
                                        </span>
                                    ) : (
                                        "BLAST OFFICIAL ALERT"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
}
