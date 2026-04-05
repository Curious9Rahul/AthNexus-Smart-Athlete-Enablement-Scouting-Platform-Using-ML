import { Link } from 'react-router-dom';
import { Home, Calendar, Trophy, BarChart3, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type DashboardView = 'overview' | 'events' | 'my-events' | 'analytics' | 'profile' | 'profile-edit';

interface DashboardSidebarProps {
    activeView: DashboardView;
    onViewChange: (view: DashboardView) => void;
}

const DashboardSidebar = ({ activeView, onViewChange }: DashboardSidebarProps) => {
    const { user, logout } = useAuth();

    const menuItems: { id: DashboardView; label: string; icon: typeof Home }[] = [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'my-events', label: 'My Events', icon: Trophy },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ];

    return (
        <aside className="w-64 bg-[#0f172a] border-r border-white/10 flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center">
                        <span className="text-[#0f172a] font-bold">S</span>
                    </div>
                    <span className="text-white font-bold tracking-tight">
                        Ath<span className="text-lime-400">Nexus</span>
                    </span>
                </Link>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-lime-400/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-lime-400" />
                    </div>
                    <div>
                        <p className="text-white font-medium">{user?.profile?.name || 'Athlete'}</p>
                        <p className="text-gray-400 text-xs">{user?.profile?.sport || 'Sport'}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                ? 'bg-lime-400 text-[#0f172a]'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/10 space-y-2">
                <button
                    onClick={() => onViewChange('profile')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                </button>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
