import { useState } from 'react';
import { Toaster } from 'sonner';
import DashboardSidebar from '@/components/DashboardSidebar';
import Chatbot from '@/components/Chatbot';
import Overview from './dashboard/Overview';
import EventsPage from './dashboard/EventsPage';
import MyEvents from './dashboard/MyEvents';
import Analytics from './dashboard/Analytics';
import ProfileForm from './ProfileForm';
import ProfileView from './ProfileView';

type DashboardView = 'overview' | 'events' | 'my-events' | 'analytics' | 'profile' | 'profile-edit';

const Dashboard = () => {
    const [activeView, setActiveView] = useState<DashboardView>('overview');

    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return <Overview onNavigate={setActiveView} />;
            case 'events':
                return <EventsPage />;
            case 'my-events':
                return <MyEvents onNavigate={setActiveView} />;
            case 'analytics':
                return <Analytics />;
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

            {/* Chatbot */}
            <Chatbot />

            {/* Toast notifications */}
            <Toaster position="bottom-right" richColors />
        </div>
    );
};

export default Dashboard;

