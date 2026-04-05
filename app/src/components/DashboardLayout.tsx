import { Outlet } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';
import Chatbot from '@/components/Chatbot';

const DashboardLayout = () => {
    return (
        <div className="flex bg-[#0f172a] text-white pt-16 lg:pt-20" style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>

            {/* Chatbot */}
            <Chatbot />
        </div>
    );
};

export default DashboardLayout;
