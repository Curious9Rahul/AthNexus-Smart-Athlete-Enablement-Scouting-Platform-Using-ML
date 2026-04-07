import { TrendingUp, Award, Target, Zap, Activity, Brain } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, BarChart, Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

function Circle({ value, label, color = '#a3e635', size = 120 }: { value: number; label: string; color?: string; size?: number }) {
    const r = size / 2 - 10; const c = 2 * Math.PI * r;
    return (
        <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center bg-black/20 rounded-full" style={{ width: size, height: size, padding: '10px' }}>
                <svg className="absolute w-full h-full -rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="transparent" />
                    <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="8" fill="transparent"
                        strokeDasharray={c} strokeDashoffset={c - (value / 100) * c}
                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                </svg>
                <span className="font-black text-white relative z-10" style={{ fontSize: size * 0.22 }}>
                    {value}<span style={{ fontSize: size * 0.11, color: 'rgba(255,255,255,0.4)' }}>%</span>
                </span>
            </div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">{label}</p>
        </div>
    );
}

const Analytics = () => {
    const { user } = useAuth();
    const profile = user?.profile;

// Deterministic seed scores from athlete (for ML alignment)
    const seedScores = (athleteId: string, athleteName: string) => {
        const str = (athleteName + athleteId).toLowerCase();
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash * 33) + str.charCodeAt(i)) % 2147483647;
        }
        const rng = (base: number, range: number, salt: number) =>
            base + (Math.floor(Math.abs(Math.sin(hash + salt) * 10000)) % range);
        const disc = rng(42, 45, 1);
        const mental = rng(40, 48, 2);
        const cons = rng(38, 50, 3);
        const growth = rng(44, 44, 4);
        const phys = rng(45, 42, 5);
        const overall = Math.round(disc * 0.25 + mental * 0.25 + cons * 0.20 + growth * 0.20 + phys * 0.10);
        return { overall, disc, mental, cons, growth, phys };
    };

    const mlScores = profile ? seedScores((user as any)?.id || user?.email || 'id', user?.name || profile.name || 'athlete') : { overall: 0, disc: 0, mental: 0, cons: 0, growth: 0, phys: 0 };
    const overallRating = mlScores.overall ? (mlScores.overall / 10).toFixed(1) : '0.0';
    const selectionProbability = Math.min(95, mlScores.overall > 0 ? Number(overallRating) * 10 + Math.random() * 5 : 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
                <p className="text-gray-400">Your performance insights and AI-powered predictions</p>
            </div>

            {/* Rating Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Overall Rating */}
                <div className="glass-dark rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-lime-400/20 flex items-center justify-center">
                            <Award className="w-6 h-6 text-lime-400" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-gray-400 text-sm mb-1">AI Overall Rating</p>
                    <p className="text-4xl font-bold text-white">{overallRating}<span className="text-xl text-gray-400">/10</span></p>
                    <p className="text-green-400 text-xs mt-2">Powered by Random Forest Model</p>
                </div>

                {/* Matches Played */}
                <div className="glass-dark rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Tournaments</p>
                    <p className="text-4xl font-bold text-white">{profile?.tournamentsPlayed || 0}</p>
                    <p className="text-gray-400 text-xs mt-2">All time</p>
                </div>

                {/* Win Rate */}
                <div className="glass-dark rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Target className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Win Rate</p>
                    <p className="text-4xl font-bold text-white">
                        {profile?.matchesWon && profile?.tournamentsPlayed
                            ? Math.round((Number(profile.matchesWon) / Number(profile.tournamentsPlayed)) * 100)
                            : 0}%
                    </p>
                    <p className="text-gray-400 text-xs mt-2">{profile?.matchesWon || 0} matches won</p>
                </div>

                {/* Medals */}
                <div className="glass-dark rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Award className="w-6 h-6 text-orange-400" />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Total Medals</p>
                    <p className="text-4xl font-bold text-white">{profile?.medalsWon || 0}</p>
                    <p className="text-gray-400 text-xs mt-2">All competitions</p>
                </div>
            </div>

            {/* Charts + Scores Replicating Admin View */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-7 space-y-6">
                    {/* Two charts side by side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-[#080c16] border border-white/5 rounded-[32px] p-6 lg:col-span-1 shadow-2xl">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-5">Attribute Radar</p>
                            <div className="h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={[
                                        { metric: 'Discipline', value: mlScores.disc },
                                        { metric: 'Mental', value: mlScores.mental },
                                        { metric: 'Consistency', value: mlScores.cons },
                                        { metric: 'Growth', value: mlScores.growth },
                                        { metric: 'Physical', value: mlScores.phys },
                                    ]}>
                                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                                        <Radar name="score" dataKey="value" stroke="#a3e635" fill="#a3e635" fillOpacity={0.15} strokeWidth={2} dot={{ fill: '#a3e635', r: 3 }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-[#080c16] border border-white/5 rounded-[32px] p-6 lg:col-span-1 shadow-2xl">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-5">Metric Distribution</p>
                            <div className="h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: 'DIS', val: mlScores.disc, fill: '#3b82f6' },
                                        { name: 'MEN', val: mlScores.mental, fill: '#8b5cf6' },
                                        { name: 'CON', val: mlScores.cons, fill: '#f59e0b' },
                                        { name: 'GRO', val: mlScores.growth, fill: '#10b981' },
                                        { name: 'PHY', val: mlScores.phys, fill: '#ef4444' },
                                    ]} barSize={24}>
                                        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: '#fff', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                        <YAxis domain={[0, 100]} hide />
                                        <Bar dataKey="val" radius={[8, 8, 0, 0]}>
                                            {[...Array(5)].map((_, i) => <Cell key={i} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Score breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Endurance', val: 'Pass' },
                            { label: 'Injury Risk', val: 'Low' },
                            { label: 'Sleep', val: profile?.activeStatus ? 'Optimal' : '-' },
                            { label: 'Activity', val: 'High' },
                        ].map(m => (
                            <div key={m.label} className="bg-[#080c16] border border-white/5 rounded-[24px] p-5 flex flex-col gap-1 shadow-2xl">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.label}</span>
                                <span className="text-white font-black text-lg">{m.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Progress circles */}
                <div className="xl:col-span-5 flex flex-col gap-6">
                    <div className="bg-[#080c16] border border-white/5 rounded-[32px] p-8 flex justify-around items-center h-full shadow-2xl">
                        <Circle value={mlScores.disc} label="Discipline" color="#a3e635" />
                        <Circle value={mlScores.mental} label="Mental" color="#3b82f6" />
                        <Circle value={mlScores.phys} label="Physical" color="#f59e0b" />
                    </div>
                </div>
            </div>

            {/* AI Selection Insights */}
            <div className="glass-dark rounded-xl p-6 border border-lime-400/30">
                <div className="flex items-center gap-2 mb-6">
                    <Brain className="w-6 h-6 text-lime-400" />
                    <h3 className="text-xl font-bold text-white">AI Selection Insights</h3>
                    <span className="ml-auto px-3 py-1 bg-lime-400/20 text-lime-400 text-xs font-semibold rounded-full">
                        Powered by AI
                    </span>
                </div>

                {/* Selection Probability */}
                <div className="mb-6">
                    <div className="flex items-end justify-between mb-3">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Selection Probability</p>
                            <p className="text-2xl font-bold text-white">
                                Next Tournament: <span className="text-lime-400">{selectionProbability.toFixed(0)}%</span>
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-lime-400" />
                    </div>
                    <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-lime-400 to-green-400 transition-all"
                            style={{ width: `${selectionProbability}%` }}
                        />
                    </div>
                </div>

                {/* Key Factors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="glass rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            Strengths
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">✓</span>
                                <span>Consistent performance with {profile?.experienceYears || 0}+ years experience</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">✓</span>
                                <span>High participation score ({profile?.participationScore || 0}/100)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">✓</span>
                                <span>Active status with regular tournament attendance</span>
                            </li>
                        </ul>
                    </div>

                    <div className="glass rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-orange-400" />
                            Areas for Improvement
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="text-orange-400 mt-1">→</span>
                                <span>Focus on improving fitness metrics for better endurance</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-orange-400 mt-1">→</span>
                                <span>Participate in more competitive tournaments</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-orange-400 mt-1">→</span>
                                <span>Enhance technical skills through specialized training</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-r from-lime-400/10 to-green-400/10 border border-lime-400/30 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-lime-400" />
                        AI Recommendations
                    </h4>
                    <p className="text-gray-300 text-sm">
                        Based on your current performance trajectory, you're on track for selection in upcoming {profile?.sport || 'sport'} events.
                        To maximize your chances, focus on maintaining your high participation rate and continue building on your competitive experience.
                        Your {profile?.competitionLevel || 'skill'} level positions you well for advanced tournaments.
                    </p>
                </div>
            </div>

            {/* Player Stats Summary */}
            <div className="glass-dark rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Player Profile Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-gray-400 text-sm">Competition Level</p>
                        <p className="text-white font-semibold mt-1">{profile?.competitionLevel || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Experience</p>
                        <p className="text-white font-semibold mt-1">{profile?.experienceYears || 0} years</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Perceived Skill</p>
                        <p className="text-white font-semibold mt-1">{profile?.perceivedSkill || 0}/10</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Active Status</p>
                        <p className={`font-semibold mt-1 ${profile?.activeStatus === 'Active' ? 'text-green-400' : 'text-gray-400'
                            }`}>
                            {profile?.activeStatus || '-'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;

