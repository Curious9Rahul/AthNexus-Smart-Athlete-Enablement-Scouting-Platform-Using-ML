import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Trophy, Search, Check, X, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

const EventPlayerSelectionPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    
    const [event, setEvent] = useState<any>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [rankedAthletes, setRankedAthletes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [ranking, setRanking] = useState(false);
    const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
    const [substitutes, setSubstitutes] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'ranked' | 'selected'>('ranked');

    // Fetch event details
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/events/${eventId}`);
                if (response.ok) {
                    const data = await response.json();
                    setEvent(data);
                } else {
                    toast.error('Event not found');
                    navigate('/dashboard/events');
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load event');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId, navigate]);

    // Fetch registered athletes
    const fetchCandidates = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/events/${eventId}/registrations`);
            if (response.ok) {
                const data = await response.json();
                setCandidates(data);
                rankAthletes(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load candidates');
        }
    };

    // Rank athletes using ML
    const rankAthletes = async (athletes: any[]) => {
        if (!event || !athletes.length) return;
        
        setRanking(true);
        try {
            const response = await fetch('http://localhost:5000/api/ml/rank_for_event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    eventDetails: {
                        sport: event.sport,
                        level: event.level,
                        gender: event.gender,
                        format: event.format,
                        state: event.state
                    },
                    candidateAthletes: athletes
                })
            });

            if (response.ok) {
                const data = await response.json();
                setRankedAthletes(data.rankedAthletes || []);
                toast.success('Athletes ranked using AI model');
            }
        } catch (error) {
            console.error(error);
            toast.error('Ranking failed');
        } finally {
            setRanking(false);
        }
    };

    // Toggle athlete selection
    const toggleSelection = (athleteId: string) => {
        if (selectedAthletes.includes(athleteId)) {
            setSelectedAthletes(selectedAthletes.filter(id => id !== athleteId));
        } else {
            if (selectedAthletes.length < (event?.players_needed || 11)) {
                setSelectedAthletes([...selectedAthletes, athleteId]);
            } else {
                toast.error(`Maximum ${event?.players_needed || 11} players allowed`);
            }
        }
    };

    // Toggle substitute selection
    const toggleSubstitute = (athleteId: string) => {
        if (substitutes.includes(athleteId)) {
            setSubstitutes(substitutes.filter(id => id !== athleteId));
        } else {
            if (substitutes.length < 2) {
                setSubstitutes([...substitutes, athleteId]);
            } else {
                toast.error('Maximum 2 substitutes allowed');
            }
        }
    };

    // Finalize selection
    const finalizeSelection = async () => {
        if (selectedAthletes.length !== (event?.players_needed || 11)) {
            toast.error(`Select exactly ${event?.players_needed || 11} main players`);
            return;
        }
        if (substitutes.length !== 2) {
            toast.error('Select exactly 2 substitutes');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/ml/select_players/${eventId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedAthleteIds: selectedAthletes,
                    substitutesIds: substitutes,
                    totalNeeded: event?.players_needed || 11
                })
            });

            if (response.ok) {
                toast.success('Player selection finalized!');
                navigate(`/dashboard/events/${eventId}`);
            }
        } catch (error) {
            console.error(error);
            toast.error('Selection failed');
        }
    };

    const filteredRanked = rankedAthletes.filter(a =>
        a.athleteName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSelectedAthlete = (id: string) => rankedAthletes.find(a => a.athleteId === id);

    if (loading || !event) {
        return (
            <div className="flex items-center justify-center py-40">
                <Spinner className="w-12 h-12 text-lime-400" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 text-lime-400 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-black tracking-[0.2em] uppercase">Player Selection</span>
                </div>
                <h1 className="text-4xl font-black text-white mb-3">{event.title}</h1>
                <div className="flex items-center gap-6 text-gray-400">
                    <span>📊 {candidates.length} Registered Athletes</span>
                    <span>👥 Select {event.players_needed || 11} + 2 Substitutes</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Panel */}
                <div className="lg:col-span-2">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 bg-[#0f172a] p-2 rounded-xl border border-white/10">
                        <button
                            onClick={() => setActiveTab('ranked')}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                                activeTab === 'ranked'
                                    ? 'bg-lime-400 text-[#0f172a]'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            🏆 Ranked Athletes ({rankedAthletes.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('selected')}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                                activeTab === 'selected'
                                    ? 'bg-lime-400 text-[#0f172a]'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            ✅ Selected ({selectedAthletes.length})
                        </button>
                    </div>

                    {activeTab === 'ranked' && (
                        <div className="space-y-4">
                            {/* Search */}
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    placeholder="Search athletes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-white/5 border-white/10 text-white"
                                />
                            </div>

                            {ranking ? (
                                <div className="flex items-center justify-center py-20 gap-3">
                                    <Loader className="w-6 h-6 text-lime-400 animate-spin" />
                                    <span className="text-gray-400 font-bold">Ranking athletes with AI...</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredRanked.length > 0 ? (
                                        filteredRanked.map((athlete, idx) => (
                                            <div
                                                key={athlete.athleteId}
                                                className="bg-[#1e293b] border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-lime-400/30 transition-all cursor-pointer"
                                                onClick={() => toggleSelection(athlete.athleteId)}
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-10 h-10 rounded-full bg-lime-400/10 flex items-center justify-center font-black text-lime-400 border border-lime-400/20">
                                                        #{athlete.rank}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{athlete.athleteName}</p>
                                                        <p className="text-xs text-gray-500">{athlete.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="font-black text-lime-400">{athlete.selectionProbability.toFixed(1)}%</p>
                                                        <p className="text-xs text-gray-500">Selection Score</p>
                                                    </div>
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all ${
                                                        selectedAthletes.includes(athlete.athleteId)
                                                            ? 'bg-lime-400 text-[#0f172a]'
                                                            : 'bg-white/5 border border-white/10 text-gray-400'
                                                    }`}>
                                                        {selectedAthletes.includes(athlete.athleteId) ? <Check className="w-5 h-5" /> : '📌'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            No athletes found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'selected' && (
                        <div className="space-y-6">
                            {/* Main Players */}
                            <div>
                                <h3 className="font-bold text-white mb-4">Main Squad ({selectedAthletes.length}/{event.players_needed || 11})</h3>
                                <div className="space-y-2">
                                    {selectedAthletes.length > 0 ? (
                                        selectedAthletes.map((athleteId, idx) => {
                                            const athlete = getSelectedAthlete(athleteId);
                                            return (
                                                <div key={athleteId} className="bg-lime-400/10 border border-lime-400/20 rounded-xl p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-lime-400 text-[#0f172a] flex items-center justify-center font-bold text-sm">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white">{athlete?.athleteName}</p>
                                                            <p className="text-xs text-gray-400">Rank #{athlete?.rank}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleSelection(athleteId)}
                                                        className="text-red-400 hover:text-red-500 transition-all"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No players selected yet
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Substitutes */}
                            <div className="border-t border-white/10 pt-6">
                                <h3 className="font-bold text-white mb-4">Substitutes ({substitutes.length}/2)</h3>
                                <div className="space-y-2">
                                    {substitutes.length > 0 ? (
                                        substitutes.map((athleteId, idx) => {
                                            const athlete = getSelectedAthlete(athleteId);
                                            return (
                                                <div key={athleteId} className="bg-blue-400/10 border border-blue-400/20 rounded-xl p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center font-bold text-sm">
                                                            🔄
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white">{athlete?.athleteName}</p>
                                                            <p className="text-xs text-gray-400">Rank #{athlete?.rank}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleSubstitute(athleteId)}
                                                        className="text-red-400 hover:text-red-500 transition-all"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No substitutes selected yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Selection Summary */}
                <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 h-fit sticky top-20 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 text-lime-400 mb-3">
                            <Trophy className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-wider">Selection Status</span>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-white font-bold">Main Squad</span>
                                    <span className={`font-black ${selectedAthletes.length === (event.players_needed || 11) ? 'text-lime-400' : 'text-gray-500'}`}>
                                        {selectedAthletes.length}/{event.players_needed || 11}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-lime-400 transition-all"
                                        style={{ width: `${(selectedAthletes.length / (event.players_needed || 11)) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-white font-bold">Substitutes</span>
                                    <span className={`font-black ${substitutes.length === 2 ? 'text-lime-400' : 'text-gray-500'}`}>
                                        {substitutes.length}/2
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-400 transition-all"
                                        style={{ width: `${(substitutes.length / 2) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    <div>
                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                            Selected players will be notified about their selection. Substitutes can be used if main squad players become unavailable.
                        </p>

                        <Button
                            onClick={fetchCandidates}
                            className="w-full mb-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs h-10 rounded-xl"
                            disabled={ranking}
                        >
                            {ranking ? '⏳ Ranking...' : '🔄 Re-rank Athletes'}
                        </Button>

                        <Button
                            onClick={finalizeSelection}
                            disabled={selectedAthletes.length !== (event.players_needed || 11) || substitutes.length !== 2}
                            className="w-full bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-black text-sm h-12 rounded-2xl shadow-lg active:scale-95 transition-all"
                        >
                            ✅ FINALIZE SELECTION
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventPlayerSelectionPage;
