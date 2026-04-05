import { useState, useMemo } from 'react';
import { Mail, Search, Send, X, CheckCircle, Users, Trophy, TrendingUp, Eye, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Athlete } from '@/hooks/useAthletes';
import { tournamentsData } from '@/data/tournamentsData';
import type { TournamentEmail } from '@/data/tournamentsData';
import { useEmailSend } from '@/hooks/useEmailSend';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

/* ── helpers ─────────────────────────────────────────────────────────────── */

/** Return athletes whose sport and profile match the tournament. */
function matchAthletes(athletes: Athlete[], tournament: TournamentEmail): Athlete[] {
    return athletes.filter((athlete) => {
        const sportMatch = athlete.sport.toLowerCase() === tournament.sport.toLowerCase();
        const levelMatch = athlete.competitionLevel.toLowerCase().includes(tournament.type.toLowerCase()) || 
                          tournament.type.toLowerCase().includes(athlete.competitionLevel.toLowerCase());
        
        return sportMatch && levelMatch;
    });
}

/** Initials from a full name */
function initials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

const AVATAR_COLORS = [
    'bg-lime-400/20 text-lime-400',
    'bg-blue-500/20 text-blue-400',
    'bg-purple-500/20 text-purple-400',
    'bg-orange-500/20 text-orange-400',
    'bg-pink-500/20 text-pink-400',
    'bg-cyan-500/20 text-cyan-400',
];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

/* ── sub-components ──────────────────────────────────────────────────────── */

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    accent?: string;
}
function StatCard({ icon, label, value, accent = 'bg-lime-400/20' }: StatCardProps) {
    return (
        <div className="glass-dark rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${accent} flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">{label}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );
}

interface EmailAlertsProps {
    onBack: () => void;
    athletes: Athlete[];
}

export default function EmailAlerts({ onBack, athletes }: EmailAlertsProps) {
    const { sendEmail, sendBulkEmail, isSending } = useEmailSend();

    const [selectedTournament, setSelectedTournament] = useState<TournamentEmail | null>(null);
    const [previewAthlete, setPreviewAthlete] = useState<Athlete | null>(null);
    const [notified, setNotified] = useState<Set<string>>(new Set());
    const [emailsSent, setEmailsSent] = useState(0);
    const [failedEmails, setFailedEmails] = useState(0);
    const [search, setSearch] = useState('');

    // Custom Email State
    const [recipientName, setRecipientName] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [isSendingCustom, setIsSendingCustom] = useState(false);
    const [emailError, setEmailError] = useState(false);

    const matchedAthletes = useMemo(
        () => (selectedTournament ? matchAthletes(athletes, selectedTournament) : []),
        [athletes, selectedTournament]
    );

    const filteredTournaments = useMemo(
        () =>
            tournamentsData.filter(
                (t) =>
                    t.tournamentName.toLowerCase().includes(search.toLowerCase()) ||
                    t.sport.toLowerCase().includes(search.toLowerCase())
            ),
        [search]
    );

    const totalSent = emailsSent;
    const successRate = totalSent + failedEmails > 0 
        ? Math.round((totalSent / (totalSent + failedEmails)) * 100) 
        : 100;

    const handleSendEmail = async (athlete: Athlete, tournament: TournamentEmail) => {
        const key = `${athlete.id}-${tournament.tournamentName}`;
        if (notified.has(key)) return;

        const result = await sendEmail(athlete.name, athlete.email, tournament);
        if (result.success) {
            setNotified((prev: Set<string>) => new Set(prev).add(key));
            setEmailsSent((n: number) => n + 1);
            toast.success(`✓ Email sent to ${athlete.name}`);
        } else {
            setFailedEmails((n: number) => n + 1);
            toast.error(`✗ Failed to send to ${athlete.name}`, {
                description: result.error
            });
        }
    };

    const handleSendCustomEmail = async () => {
        if (!selectedTournament) {
            toast.error('Please select a tournament first');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!recipientEmail || !emailRegex.test(recipientEmail)) {
            setEmailError(true);
            toast.error('Please enter a valid email address');
            return;
        }

        setEmailError(false);
        setIsSendingCustom(true);

        const result = await sendEmail(
            recipientName || "Athlete",
            recipientEmail,
            selectedTournament
        );

        if (result.success) {
            toast.success(`✓ Email sent to ${recipientEmail}`);
            setRecipientName('');
            setRecipientEmail('');
            setEmailsSent((n: number) => n + 1);
        } else {
            toast.error('✗ Failed to send — check Resend account credentials', {
                description: result.error
            });
            setFailedEmails((n: number) => n + 1);
        }

        setIsSendingCustom(false);
    };

    const handleSendToAll = async () => {
        if (!selectedTournament) return;
        const toSend = matchedAthletes.filter(
            (a: Athlete) => !notified.has(`${a.id}-${selectedTournament.tournamentName}`)
        );

        if (toSend.length === 0) {
            toast.info('All matched athletes have already been notified.');
            return;
        }

        const players = toSend.map((a: Athlete) => ({ playerName: a.name, playerEmail: a.email }));
        const result = await sendBulkEmail(players, selectedTournament);

        if (result.success) {
            const nextSet = new Set(notified);
            result.results.forEach((r, index) => {
                if (r.status === 'fulfilled') {
                    nextSet.add(`${toSend[index].id}-${selectedTournament.tournamentName}`);
                }
            });
            setNotified(nextSet);
            setEmailsSent((n: number) => n + result.sent);
            setFailedEmails((n: number) => n + result.failed);

            if (result.failed === 0) {
                toast.success(`✓ ${result.sent} emails sent successfully`);
            } else {
                toast.warning(`⚠ ${result.sent} sent, ${result.failed} failed`);
            }
        }
    };

    const EmailPreview = ({ athlete, tournament }: { athlete: Athlete; tournament: TournamentEmail }) => {
        const urgencyBanner = tournament.hoursLeft <= 24 
            ? `<div style="background: #450a0a; border-left: 4px solid #ef4444; padding: 16px; margin: 0 32px 24px; color: #fca5a5; font-size: 14px;">🚨 <strong>CRITICAL</strong> — Only ${tournament.hoursLeft} hours left to register! Act now.</div>`
            : tournament.hoursLeft <= 48
            ? `<div style="background: #431407; border-left: 4px solid #f97316; padding: 16px; margin: 0 32px 24px; color: #fdba74; font-size: 14px;">⚡ <strong>URGENT</strong> — ${tournament.hoursLeft} hours remaining. Registration closing very soon.</div>`
            : tournament.hoursLeft <= 72
            ? `<div style="background: #422006; border-left: 4px solid #f59e0b; padding: 16px; margin: 0 32px 24px; color: #fcd34d; font-size: 14px;">⏰ <strong>Closing Soon</strong> — ${tournament.hoursLeft} hours left to secure your spot.</div>`
            : '';

        const slotsUrgency = tournament.slotsLeft <= 10 
            ? `<span style="color: #ef4444; font-weight: 700;">${tournament.slotsLeft} of ${tournament.totalSlots} — Hurry!</span>`
            : `${tournament.slotsLeft} of ${tournament.totalSlots}`;

        const html = `
            <div style="background: #0a0f1a; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #f1f5f9; padding: 20px;">
                <div style="background: #0f172a; padding: 28px 32px; border-bottom: 3px solid #84cc16;">
                    <div style="font-size: 28px; font-weight: 800; color: #84cc16; letter-spacing: 2px;">AthNexus</div>
                </div>
                <div style="background: #0f172a; padding: 24px 32px;">
                    <div style="font-size: 20px; font-weight: 700;">Hey ${athlete.name}! 👋</div>
                    <p style="color: #94a3b8; font-size: 14px;">A tournament matches your athlete profile.</p>
                </div>
                ${urgencyBanner}
                <div style="background: #1e293b; padding: 24px; border-radius: 12px; border: 1px solid #334155; border-top: 4px solid #84cc16;">
                    <div style="font-size: 20px; font-weight: 800; margin-bottom: 15px;">${tournament.tournamentName}</div>
                    <div style="font-size: 13px; color: #e2e8f0;">
                        <p>📅 ${tournament.date} | ⏰ ${tournament.time}</p>
                        <p>📍 ${tournament.venue}</p>
                        <p>🏆 ${tournament.type} | 🎯 ${tournament.sport}</p>
                        <p>💰 Prize: ${tournament.prizePool} | 🎫 Slots: ${slotsUrgency}</p>
                    </div>
                </div>
                <div style="text-align: center; padding: 30px;">
                    <div style="background: #84cc16; color: #0f172a; padding: 12px 30px; border-radius: 8px; font-weight: 800; display: inline-block;">REGISTER NOW →</div>
                </div>
                <div style="background: #1e293b; padding: 15px; border-radius: 8px; font-size: 12px; color: #94a3b8;">
                    Matched on: ${athlete.sport} • ${athlete.competitionLevel}
                </div>
            </div>
        `;

        return <div dangerouslySetInnerHTML={{ __html: html }} className="bg-[#0a0f1a] rounded-lg overflow-hidden border border-white/10" />;
    };

    return (
        <div className="space-y-6">
            <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-gray-400 hover:text-white mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Button>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={<Users className="w-5 h-5" />} label="Relevant Athletes" value={athletes.length} />
                <StatCard icon={<Trophy className="w-5 h-5 text-blue-400" />} label="Active Tournaments" value={tournamentsData.length} accent="bg-blue-500/20" />
                <StatCard icon={<Mail className="w-5 h-5 text-orange-400" />} label="Campaigns Sent" value={emailsSent} accent="bg-orange-500/20" />
                <StatCard icon={<TrendingUp className="w-5 h-5 text-green-400" />} label="Success Rate" value={`${successRate}%`} accent="bg-green-500/20" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Tournaments */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search tournaments or sports..."
                            className="w-full bg-[#1e293b] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-lime-400 transition-colors"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredTournaments.map((t: TournamentEmail) => {
                            const matched = matchAthletes(athletes, t);
                            const isSelected = selectedTournament?.tournamentName === t.tournamentName;

                            return (
                                <div
                                    key={t.tournamentName}
                                    onClick={() => {
                                        setSelectedTournament(t);
                                        setPreviewAthlete(null);
                                    }}
                                    className={`p-4 rounded-xl cursor-pointer border transition-all ${
                                        isSelected 
                                            ? 'bg-lime-400/10 border-lime-400/50' 
                                            : 'bg-[#1e293b] border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-lg font-bold text-white">{t.tournamentName}</span>
                                        {t.hoursLeft <= 72 && (
                                            <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                Closing Soon
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                                        <span className="bg-white/5 px-2 py-1 rounded">{t.sport}</span>
                                        <span className="bg-white/5 px-2 py-1 rounded">{t.type}</span>
                                        <span className="text-lime-400 font-semibold">{matched.length} athletes matched</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Athletes & Preview */}
                <div className="lg:col-span-3 space-y-6">
                    {!selectedTournament ? (
                        <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-gray-500 bg-white/5">
                            <Mail className="w-12 h-12 mb-4 opacity-20" />
                            <p>Select a tournament to view matched athletes</p>
                        </div>
                    ) : (
                        <>
                            {/* Custom Email Send Section */}
                            <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/10 shadow-xl">
                                <h3 className="text-xl font-bold text-white mb-6">Direct Alerts</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Recipient Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter recipient name"
                                            value={recipientName}
                                            onChange={(e) => setRecipientName(e.target.value)}
                                            disabled={isSendingCustom}
                                            className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-lime-400/50 transition-all disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="Enter email address"
                                            value={recipientEmail}
                                            onChange={(e) => {
                                                setRecipientEmail(e.target.value);
                                                if (emailError) setEmailError(false);
                                            }}
                                            disabled={isSendingCustom}
                                            className={`w-full bg-black/20 border ${emailError ? 'border-red-500/50' : 'border-white/5'} rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-lime-400/50 transition-all disabled:opacity-50`}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-gray-500 text-sm">
                                        <span className="text-gray-600 mr-2 font-medium">Auto-Template:</span>
                                        <span className="text-gray-300">{selectedTournament.tournamentName}</span>
                                    </div>
                                    <button 
                                        onClick={handleSendCustomEmail}
                                        disabled={isSendingCustom || !recipientEmail}
                                        className="h-[46px] bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/10"
                                    >
                                        {isSendingCustom ? <Spinner className="w-5 h-5 leading-none" /> : "Send Alert →"}
                                    </button>
                                </div>
                                {emailError && (
                                    <p className="text-red-500 text-xs mt-2 ml-1">Please enter a valid email address</p>
                                )}
                            </div>

                            <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Matches ({matchedAthletes.length})</h3>
                                    <button 
                                        onClick={handleSendToAll}
                                        disabled={isSending || matchedAthletes.length === 0}
                                        className="bg-lime-400 hover:bg-lime-300 text-[#0f172a] font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isSending ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                        Notify All Matched
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {matchedAthletes.map((athlete: Athlete) => {
                                        const isNotified = notified.has(`${athlete.id}-${selectedTournament.tournamentName}`);
                                        return (
                                            <div key={athlete.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${avatarColor(athlete.id)}`}>
                                                        {initials(athlete.name)}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{athlete.name}</p>
                                                        <p className="text-gray-500 text-xs">{athlete.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isNotified ? (
                                                        <span className="text-green-400 text-xs font-bold flex items-center gap-1 bg-green-400/10 px-2 py-1 rounded-full">
                                                            <CheckCircle className="w-3 h-3" /> Sent
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <button 
                                                                onClick={() => setPreviewAthlete(athlete)}
                                                                className="text-gray-400 hover:text-white p-2 transition-colors"
                                                                title="Preview Template"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleSendEmail(athlete, selectedTournament)}
                                                                disabled={isSending}
                                                                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
                                                            >
                                                                <Send className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {previewAthlete && (
                                <div className="bg-[#1e293b] rounded-2xl border border-blue-400/30 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-blue-500/10 p-4 border-b border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-blue-400" />
                                            <span className="text-white font-semibold">Campaign Preview — {previewAthlete.name}</span>
                                        </div>
                                        <button onClick={() => setPreviewAthlete(null)} className="text-gray-400 hover:text-white transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-6 max-h-[500px] overflow-y-auto bg-gray-900 custom-scrollbar">
                                        <EmailPreview athlete={previewAthlete} tournament={selectedTournament} />
                                    </div>
                                    <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
                                        <button 
                                            onClick={() => {
                                                handleSendEmail(previewAthlete, selectedTournament);
                                                setPreviewAthlete(null);
                                            }}
                                            disabled={isSending}
                                            className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                                        >
                                            <Send className="w-4 h-4" />
                                            Send Now
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
