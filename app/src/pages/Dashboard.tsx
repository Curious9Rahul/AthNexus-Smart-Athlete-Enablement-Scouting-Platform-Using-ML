import { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import Chatbot from '@/components/Chatbot';
import Overview from './dashboard/Overview';
import Events from './dashboard/Events';
import MyEvents from './dashboard/MyEvents';
import Analytics from './dashboard/Analytics';
import ProfileForm from './ProfileForm';

type DashboardView = 'overview' | 'events' | 'my-events' | 'analytics' | 'profile';

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
            case 'profile':
                return <ProfileForm onComplete={() => setActiveView('overview')} />;
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

            {/* Chatbot */}
            <Chatbot />
        </div>
    );
};

export default Dashboard;
