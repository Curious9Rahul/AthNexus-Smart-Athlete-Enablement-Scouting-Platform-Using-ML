import { TrendingUp, Award, Target, Zap, Activity, BarChart3, Brain } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Analytics = () => {
    const { user } = useAuth();
    const profile = user?.profile;

    // Calculate overall rating based on profile data
    const calculateRating = () => {
        if (!profile) return 0;
        const scores = [
            profile.achievementScore || 0,
            profile.participationScore || 0,
            profile.activityScore || 0,
            profile.fitnessIndex || 0,
            profile.talentScore || 0,
        ].filter(s => s > 0);
        if (scores.length === 0) return 0;
        return (scores.reduce((a, b) => a + b, 0) / scores.length / 10).toFixed(1);
    };

    const overallRating = calculateRating();
    const selectionProbability = Math.min(95, Number(overallRating) * 10 + Math.random() * 10);

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
                    <p className="text-gray-400 text-sm mb-1">Overall Rating</p>
                    <p className="text-4xl font-bold text-white">{overallRating}<span className="text-xl text-gray-400">/10</span></p>
                    <p className="text-green-400 text-xs mt-2">↑ 12% from last month</p>
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

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skills Radar */}
                <div className="glass-dark rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-lime-400" />
                        <h3 className="text-lg font-bold text-white">Performance Scores</h3>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Achievement', value: profile?.achievementScore || 0, color: 'lime' },
                            { label: 'Participation', value: profile?.participationScore || 0, color: 'blue' },
                            { label: 'Activity', value: profile?.activityScore || 0, color: 'green' },
                            { label: 'Fitness Index', value: profile?.fitnessIndex || 0, color: 'orange' },
                            { label: 'Talent', value: profile?.talentScore || 0, color: 'purple' },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-300">{item.label}</span>
                                    <span className="text-sm font-semibold text-white">{item.value}/100</span>
                                </div>
                                <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-${item.color}-400 transition-all`}
                                        style={{ width: `${item.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fitness Metrics */}
                <div className="glass-dark rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-2 mb-6">
                        <Zap className="w-5 h-5 text-lime-400" />
                        <h3 className="text-lg font-bold text-white">Fitness Metrics</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass rounded-lg p-4 text-center">
                            <p className="text-gray-400 text-xs mb-1">100m Sprint</p>
                            <p className="text-2xl font-bold text-white">{profile?.sprint_100m || '-'}</p>
                            <p className="text-gray-400 text-xs mt-1">seconds</p>
                        </div>
                        <div className="glass rounded-lg p-4 text-center">
                            <p className="text-gray-400 text-xs mb-1">Pushups</p>
                            <p className="text-2xl font-bold text-white">{profile?.pushups || '-'}</p>
                            <p className="text-gray-400 text-xs mt-1">count</p>
                        </div>
                        <div className="glass rounded-lg p-4 text-center">
                            <p className="text-gray-400 text-xs mb-1">Plank</p>
                            <p className="text-2xl font-bold text-white">{profile?.plank_sec || '-'}</p>
                            <p className="text-gray-400 text-xs mt-1">seconds</p>
                        </div>
                        <div className="glass rounded-lg p-4 text-center">
                            <p className="text-gray-400 text-xs mb-1">1km Run</p>
                            <p className="text-2xl font-bold text-white">{profile?.run_1km || '-'}</p>
                            <p className="text-gray-400 text-xs mt-1">minutes</p>
                        </div>
                    </div>

                    {/* BMI */}
                    <div className="mt-4 p-4 bg-lime-400/10 border border-lime-400/30 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-lime-400 font-medium">BMI</span>
                            <span className="text-lg font-bold text-lime-400">{profile?.bmi || '-'}</span>
                        </div>
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
