import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Trophy, Target, Award, TrendingUp, Activity, Zap, Edit } from 'lucide-react';

interface ProfileViewProps {
    onBack: () => void;
    onEdit: () => void;
}

const ProfileView = ({ onBack, onEdit }: ProfileViewProps) => {
    const { user } = useAuth();
    const profile = user?.profile;

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <p className="text-gray-400">No profile data available</p>
            </div>
        );
    }

    // Generate initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        onClick={onBack}
                        variant="ghost"
                        className="text-gray-400 hover:text-white hover:bg-white/5"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <Button
                        onClick={onEdit}
                        className="bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-semibold"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>
                </div>

                {/* Profile Header Card */}
                <div className="glass-dark rounded-2xl p-8 mb-6 border border-white/10">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Profile Avatar */}
                        <div className="relative">
                            {profile.profileImage ? (
                                <img
                                    src={profile.profileImage}
                                    alt={profile.name}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-lime-400 shadow-lg"
                                    onError={(e) => {
                                        // Fallback to initials if image fails to load
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div
                                className="w-32 h-32 rounded-full bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-4xl font-bold text-[#0f172a] shadow-lg"
                                style={{ display: profile.profileImage ? 'none' : 'flex' }}
                            >
                                {getInitials(profile.name)}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-lime-400 flex items-center justify-center border-4 border-[#0f172a]">
                                <User className="w-5 h-5 text-[#0f172a]" />
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white mb-2">{profile.name}</h1>
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                                <span className="px-3 py-1 rounded-full bg-lime-400/20 text-lime-400 text-sm font-medium">
                                    {profile.sport}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-sm">
                                    {profile.position}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-sm">
                                    {profile.competitionLevel}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-400 justify-center md:justify-start">
                                <span>{profile.department}</span>
                                <span>•</span>
                                <span>{profile.year}</span>
                                <span>•</span>
                                <span>{profile.experienceYears} years experience</span>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="text-center">
                            <div className={`px-4 py-2 rounded-full font-semibold ${profile.activeStatus === 'Active'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                                }`}>
                                {profile.activeStatus}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievements Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="glass-dark rounded-2xl p-6 border border-white/10 hover-lift">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Tournaments Played</p>
                                <p className="text-2xl font-bold text-white">{profile.tournamentsPlayed || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-dark rounded-2xl p-6 border border-white/10 hover-lift">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Target className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Matches Won</p>
                                <p className="text-2xl font-bold text-white">{profile.matchesWon || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-dark rounded-2xl p-6 border border-white/10 hover-lift">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Award className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Medals Won</p>
                                <p className="text-2xl font-bold text-white">{profile.medalsWon || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Physical Stats */}
                    <div className="glass-dark rounded-2xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-lime-400" />
                            Physical Stats
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-400 text-sm">Age</p>
                                <p className="text-white font-semibold">{profile.age} years</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Gender</p>
                                <p className="text-white font-semibold">{profile.gender}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Height</p>
                                <p className="text-white font-semibold">{profile.height_cm} cm</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Weight</p>
                                <p className="text-white font-semibold">{profile.weight_kg} kg</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">BMI</p>
                                <p className="text-white font-semibold">{profile.bmi}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Skill Level</p>
                                <p className="text-white font-semibold">{profile.perceivedSkill}/10</p>
                            </div>
                        </div>
                    </div>

                    {/* Performance Scores */}
                    <div className="glass-dark rounded-2xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-lime-400" />
                            Performance Scores
                        </h2>
                        <div className="space-y-3">
                            {[
                                { label: 'Achievement', value: profile.achievementScore },
                                { label: 'Participation', value: profile.participationScore },
                                { label: 'Activity', value: profile.activityScore },
                                { label: 'Fitness Index', value: profile.fitnessIndex },
                                { label: 'Talent', value: profile.talentScore },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">{item.label}</span>
                                        <span className="text-white font-semibold">{item.value || 0}/100</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-2">
                                        <div
                                            className="bg-lime-400 h-2 rounded-full transition-all"
                                            style={{ width: `${item.value || 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Fitness Metrics */}
                <div className="glass-dark rounded-2xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-lime-400" />
                        Fitness Metrics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-lime-400/20 flex items-center justify-center">
                                <span className="text-2xl">🏃</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-1">100m Sprint</p>
                            <p className="text-white font-bold">{profile.sprint_100m || 'N/A'}s</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-lime-400/20 flex items-center justify-center">
                                <span className="text-2xl">💪</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-1">Pushups</p>
                            <p className="text-white font-bold">{profile.pushups || 'N/A'}</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-lime-400/20 flex items-center justify-center">
                                <span className="text-2xl">🧘</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-1">Plank</p>
                            <p className="text-white font-bold">{profile.plank_sec || 'N/A'}s</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-lime-400/20 flex items-center justify-center">
                                <span className="text-2xl">🏃‍♂️</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-1">1km Run</p>
                            <p className="text-white font-bold">{profile.run_1km || 'N/A'}m</p>
                        </div>
                    </div>
                </div>

                {/* Highest Level Section */}
                <div className="mt-6 glass-dark rounded-2xl p-6 border border-white/10 text-center">
                    <h2 className="text-xl font-bold text-white mb-4">Competition Level</h2>
                    <div className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-lime-400/20 to-lime-600/20 border-2 border-lime-400">
                        <p className="text-3xl font-bold text-lime-400">{profile.competitionLevel || 'Not Set'}</p>
                        <p className="text-gray-400 text-sm mt-2">Highest Level Achieved</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;

