import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Trophy, CheckSquare, Users, User, LogOut, Settings, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DashboardSidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const athleteMenuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: Home, exact: true },
        { path: '/dashboard/my-events', label: 'My Events', icon: Trophy, exact: false },
        { path: '/dashboard/events', label: 'Explore Events', icon: Calendar, exact: false },
        { path: '/profile-setup', label: 'My Profile', icon: User, exact: false },
        { path: '/settings', label: 'Settings', icon: Settings, exact: false },
    ];

    const verifierMenuItems = [
        { path: '/verifier/event-approval', label: 'Event Approval', icon: CheckSquare, exact: false },
        { path: '/verifier/registration-approval', label: 'Registration Approval', icon: Users, exact: false },
        { path: '/verifier/events', label: 'Events Database', icon: Calendar, exact: false },
        { path: '/verifier/email-alerts', label: 'Email Alerts', icon: Mail, exact: false },
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
        <aside className="w-64 bg-[#0f172a] border-r border-white/10 flex flex-col h-screen sticky top-0 shrink-0">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center">
                        <span className="text-[#0f172a] font-bold">S</span>
                    </div>
                    <span className="text-white font-bold tracking-tight">
                        Ath<span className="text-lime-400">Nexus</span>
                    </span>
                </div>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-white/10">
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
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
