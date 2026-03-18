import { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import Overview from './dashboard/Overview';
import Events from './dashboard/Events';
import MyEvents from './dashboard/MyEvents';
import Analytics from './dashboard/Analytics';
import DashboardAIAssistant from './dashboard/AIAssistant';
import ProfileForm from './ProfileForm';
import ProfileView from './ProfileView';
import type { DashboardView } from '@/types/dashboard';

const Dashboard = () => {
    const [activeView, setActiveView] = useState<DashboardView>('overview');

    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return <Overview onNavigate={setActiveView} />;
            case 'events':
                return <Events />;
            case 'my-events':
                return <MyEvents />;
            case 'analytics':
                return <Analytics />;
            case 'ai-assistant':
                return <DashboardAIAssistant />;
            case 'profile':
                return <ProfileView
                    onBack={() => setActiveView('overview')}
                    onEdit={() => setActiveView('profile-edit')}
                />;
            case 'profile-edit':
                return <ProfileForm onComplete={() => setActiveView('profile')} />;
            default:
                return <Overview onNavigate={setActiveView} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0f172a]">
            {/* Sidebar */}
            <DashboardSidebar activeView={activeView} onViewChange={setActiveView} />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default Dashboard;
