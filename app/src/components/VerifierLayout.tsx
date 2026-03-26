import { Outlet } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';

const VerifierLayout = () => {
    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default VerifierLayout;
