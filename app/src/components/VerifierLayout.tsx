import { Outlet } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';

const VerifierLayout = () => {
    return (
        <div className="flex bg-[#0f172a] text-white pt-16 lg:pt-20" style={{ minHeight: '100vh' }}>
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
