import { Calendar, Trophy, TrendingUp, Zap, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { DigiLockerVerify } from '@/components/abc/DigiLockerVerify';
import { ProfileSync } from '@/components/abc/ProfileSync';

const Overview = () => {
    const { user } = useAuth();
    const profile = user?.profile;
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="glass-dark rounded-xl p-8 border border-white/10 bg-gradient-to-r from-lime-400/10 to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h1 className="text-3xl font-bold text-white mb-2">
                       Welcome back, {user?.verified_name || profile?.name || 'Athlete'}! 👋
                   </h1>
                   <p className="text-gray-400 mb-4">
                       Your personalized sports management dashboard
                   </p>
                   {user?.is_scoutable && (
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                           👁️ Scoutable Profile
                       </span>
                   )}
                </div>
                <div className="flex flex-col gap-3">
                   <DigiLockerVerify />
                   <ProfileSync />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-dark rounded-xl p-6 border border-white/10 hover-lift cursor-pointer" onClick={() => navigate('/dashboard/my-events')}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-lime-400/20 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-lime-400" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Active Events</p>
                    <p className="text-3xl font-bold text-white">2</p>
                </div>

                <div className="glass-dark rounded-xl p-6 border border-white/10 hover-lift cursor-pointer" onClick={() => navigate('/dashboard/analytics')}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Total Medals</p>
                    <p className="text-3xl font-bold text-white">{profile?.medalsWon || 0}</p>
                </div>

                <div className="glass-dark rounded-xl p-6 border border-white/10 hover-lift cursor-pointer" onClick={() => navigate('/dashboard/analytics')}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Award className="w-6 h-6 text-orange-400" />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Overall Rating</p>
                    <p className="text-3xl font-bold text-white">
                        {profile?.achievementScore ? (profile.achievementScore / 10).toFixed(1) : '0.0'}
                        <span className="text-lg text-gray-400">/10</span>
                    </p>
                </div>

                <div className="glass-dark rounded-xl p-6 border border-white/10 hover-lift cursor-pointer" onClick={() => navigate('/dashboard/events')}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Available Events</p>
                    <p className="text-3xl font-bold text-white">4</p>
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="glass-dark rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
                    <Button
                        onClick={() => navigate('/dashboard/my-events')}
                        variant="ghost"
                        className="text-lime-400 hover:text-lime-300"
                    >
                        View All
                    </Button>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-lime-400/20 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-lime-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Inter-College Basketball Championship</h3>
                                <p className="text-gray-400 text-sm">March 15, 2026 • Sports Complex Arena</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                            Confirmed
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Summer Football League</h3>
                                <p className="text-gray-400 text-sm">March 20, 2026 • Main Stadium</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-full">
                            Pending
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-dark rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Performance Insights</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-lime-400"></div>
                            <p className="text-gray-300 text-sm">You're in the top 15% of {profile?.sport || 'sport'} players</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <p className="text-gray-300 text-sm">85% selection probability for next event</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <p className="text-gray-300 text-sm">Fitness index improved by 12% this month</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate('/dashboard/analytics')}
                        className="w-full mt-4 bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-semibold"
                    >
                        View Full Analytics
                    </Button>
                </div>

                <div className="glass-dark rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">New Events Available</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-lime-400"></div>
                            <p className="text-gray-300 text-sm">4 new {profile?.sport || 'sport'} tournaments registered</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                            <p className="text-gray-300 text-sm">Registration closing soon for 2 events</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <p className="text-gray-300 text-sm">Match your skill level perfectly</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate('/dashboard/events')}
                        className="w-full mt-4 bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-semibold"
                    >
                        Browse Events
                    </Button>
                </div>
            </div>

            {/* Profile Completion */}
            <div className="glass-dark rounded-xl p-6 border border-lime-400/30 bg-gradient-to-r from-lime-400/5 to-transparent">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-lime-400/20 flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-lime-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-semibold mb-2">Your profile is complete!</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Great job! Your complete profile helps our AI make better predictions and recommendations.
                        </p>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-lime-400"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;

