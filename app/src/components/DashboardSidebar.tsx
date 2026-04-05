import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Trophy, CheckSquare, Users, User, Settings, Mail, Users2, X, MapPin, Activity, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DashboardSidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    const [showStaticProfile, setShowStaticProfile] = useState(false);

    const athleteMenuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: Home, exact: true },
        { path: '/dashboard/my-events', label: 'My Events', icon: Trophy, exact: false },
        { path: '/dashboard/events', label: 'Explore Events', icon: Calendar, exact: false },
        { path: '#static-profile', label: 'My Profile', icon: User, exact: false },
        { path: '/settings', label: 'Settings', icon: Settings, exact: false },
    ];

    const verifierMenuItems = [
        { path: '/verifier/event-approval', label: 'Event Approval', icon: CheckSquare, exact: false },
        { path: '/verifier/registration-approval', label: 'Registration Approval', icon: Users, exact: false },
        { path: '/verifier/events', label: 'Events Database', icon: Calendar, exact: false },
        { path: '/verifier/email-alerts', label: 'Email Alerts', icon: Mail, exact: false },
        { path: '/verifier/user-management', label: 'User Management', icon: Users2, exact: false },
        { path: '/settings', label: 'Settings', icon: Settings, exact: false },
    ];

    const menuItems = user?.role === 'verifier' ? verifierMenuItems : athleteMenuItems;

    const isActive = (path: string, exact: boolean) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="w-64 bg-[#0f172a] border-r border-white/10 flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] sticky top-16 lg:top-20 shrink-0">
            {/* User Info */}
            <div
                className="p-6 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setShowStaticProfile(true)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-lime-400/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-lime-400" />
                    </div>
                    <div>
                        <p className="text-white font-medium">{user?.profile?.name || (user?.role === 'verifier' ? 'Verifier' : 'Athlete')}</p>
                        <p className="text-gray-400 text-xs">
                            {user?.role === 'verifier' ? 'Verifier' : (user?.profile?.sport || 'Sport')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path, item.exact);

                    if (item.path === '#static-profile') {
                        return (
                            <button
                                key={item.path}
                                onClick={() => setShowStaticProfile(true)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-400 hover:bg-white/5 hover:text-white`}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                <span className="font-medium text-left">{item.label}</span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                                ? 'bg-lime-400 text-[#0f172a]'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/10 space-y-2">
                {/* Logout button removed as per request */}
            </div>
            {/* Static Profile Modal */}
            {showStaticProfile && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#111a28] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl relative">
                        {/* Header Image */}
                        <div className="h-32 bg-gradient-to-r from-lime-500/30 to-teal-500/30 relative">
                            <button
                                onClick={() => setShowStaticProfile(false)}
                                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Avatar & Content */}
                        <div className="px-6 pb-8 relative">
                            <div className="w-24 h-24 rounded-full bg-[#0f172a] border-4 border-[#111a28] flex items-center justify-center absolute -top-12 left-6 ring-2 ring-lime-400/20">
                                <User className="w-12 h-12 text-lime-400" />
                            </div>

                            {/* Action Button */}
                            <div className="flex justify-end mt-4">
                                <button className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white font-medium transition-colors" onClick={() => setShowStaticProfile(false)}>
                                    Edit Profile
                                </button>
                            </div>

                            <div className="mt-4">
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    {user?.profile?.name || (user?.role === 'verifier' ? 'Verifier' : 'Alex Johnson')}
                                </h2>
                                <p className="text-lime-400 font-medium">
                                    {user?.role === 'verifier' ? 'AthNexus Admin' : (user?.profile?.sport || 'Basketball • Point Guard')}
                                </p>

                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <span>Los Angeles, CA</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                            <Activity className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <span>Height: 6'2"  •  Weight: 185 lbs</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                            <Award className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <span>NCAA Div I Prospect</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Latest Stats</h3>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="bg-white/5 rounded-xl border border-white/5 p-4">
                                            <div className="text-2xl font-bold text-white">24.5</div>
                                            <div className="text-xs text-gray-400 mt-1 uppercase font-semibold tracking-wider">PPG</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl border border-white/5 p-4">
                                            <div className="text-2xl font-bold text-white">8.2</div>
                                            <div className="text-xs text-gray-400 mt-1 uppercase font-semibold tracking-wider">APG</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl border border-white/5 p-4">
                                            <div className="text-2xl font-bold text-white">4.1</div>
                                            <div className="text-xs text-gray-400 mt-1 uppercase font-semibold tracking-wider">RPG</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </aside>
    );
};

export default DashboardSidebar;
