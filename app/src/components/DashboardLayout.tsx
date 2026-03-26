import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import DashboardSidebar from '@/components/DashboardSidebar';
import Chatbot from '@/components/Chatbot';

const DashboardLayout = () => {
    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white">
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
