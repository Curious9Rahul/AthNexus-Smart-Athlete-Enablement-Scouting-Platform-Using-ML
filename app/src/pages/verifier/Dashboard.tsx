import { useState, useEffect, useMemo } from 'react';
import { useAthletes } from '@/hooks/useAthletes';
import type { Athlete } from '@/hooks/useAthletes';
import PlayerCard from '@/components/verifier/PlayerCard';
import EmailAlerts from '@/components/verifier/EmailAlerts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Shield, CheckCircle, XCircle, Clock, LayoutDashboard, Mail, LogOut, Plus, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
type DashboardView = 'DASHBOARD' | 'EMAIL_ALERTS';

interface AthleteWithStatus extends Athlete {
    verificationStatus: VerificationStatus;
}

const VerifierDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { athletes: initialAthletes, loading } = useAthletes();
    const [athletes, setAthletes] = useState<AthleteWithStatus[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<VerificationStatus | 'ALL'>('PENDING');
    const [view, setView] = useState<DashboardView>('DASHBOARD');

    useEffect(() => {
        if (initialAthletes.length > 0) {
            setAthletes(initialAthletes.map(a => ({
                ...a,
                verificationStatus: (a.id % 5 === 0) ? 'VERIFIED' : 'PENDING'
            })));
        }
    }, [initialAthletes]);

    if (!user || user.role !== 'verifier') {
        return <Navigate to="/dashboard" replace />;
    }

    const handleVerify = (id: number) => {
        setAthletes(prev => prev.map(a =>
            a.id === id ? { ...a, verificationStatus: 'VERIFIED' } : a
        ));
        toast.success('Athlete verified successfully');
    };

    const handleReject = (id: number) => {
        setAthletes(prev => prev.map(a =>
            a.id === id ? { ...a, verificationStatus: 'REJECTED' } : a
        ));
        toast.error('Athlete verification rejected');
    };

    const filteredAthletes = athletes.filter(athlete => {
        const matchesSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            athlete.sport.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || athlete.verificationStatus === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = useMemo(() => ({
        total: athletes.length,
        pending: athletes.filter(a => a.verificationStatus === 'PENDING').length,
        verified: athletes.filter(a => a.verificationStatus === 'VERIFIED').length,
        rejected: athletes.filter(a => a.verificationStatus === 'REJECTED').length,
    }), [athletes]);

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6 pt-24 pb-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <Shield className="w-5 h-5" />
                            <span className="text-sm font-semibold tracking-wider uppercase">Verifier Portal</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold">Athlete Verifications</h1>
                            {view === 'DASHBOARD' && (
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setView('EMAIL_ALERTS')}
                                        className="bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 gap-2 h-9"
                                    >
                                        <Mail className="w-4 h-4" />
                                        Email Alerts
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate('/dashboard')}
                                        className="bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 gap-2 h-9"
                                    >
                                        <Globe className="w-4 h-4" />
                                        Discovery
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => navigate('/verifier/create-event')}
                                        className="bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-bold gap-2 h-9"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Event
                                    </Button>
                                </div>
                            )}
                        </div>
                        <p className="text-gray-400 mt-1">
                            {view === 'DASHBOARD'
                                ? 'Review and manage athlete profiles and documents.'
                                : 'Send tournament alerts and notifications to athletes.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 self-start md:self-center">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                            <div className="px-4 py-2 text-center">
                                <p className="text-gray-500 text-[10px] uppercase font-bold">Pending</p>
                                <p className="text-yellow-500 font-bold">{stats.pending}</p>
                            </div>
                            <div className="w-px h-8 bg-white/10 self-center" />
                            <div className="px-4 py-2 text-center">
                                <p className="text-gray-500 text-[10px] uppercase font-bold">Verified</p>
                                <p className="text-green-500 font-bold">{stats.verified}</p>
                            </div>
                            <div className="w-px h-8 bg-white/10 self-center" />
                            <div className="px-4 py-2 text-center">
                                <p className="text-gray-500 text-[10px] uppercase font-bold">Rejected</p>
                                <p className="text-red-500 font-bold">{stats.rejected}</p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </Button>
                    </div>
                </div>

                {view === 'EMAIL_ALERTS' ? (
                    <EmailAlerts
                        onBack={() => setView('DASHBOARD')}
                        athletes={athletes}
                    />
                ) : (
                    <>
                        {/* Filters Row */}
                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name or sport..."
                                    className="pl-10 bg-white/5 border-white/10 focus:border-blue-500 focus:ring-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                                {(['PENDING', 'VERIFIED', 'REJECTED', 'ALL'] as const).map((status) => (
                                    <Button
                                        key={status}
                                        variant={filterStatus === status ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setFilterStatus(status)}
                                        className={`rounded-full px-4 h-9 text-xs transition-all ${filterStatus === status
                                                ? 'bg-blue-500 hover:bg-blue-600 text-white border-transparent'
                                                : 'bg-transparent border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {status === 'PENDING' && <Clock className="w-3.5 h-3.5 mr-1.5" />}
                                        {status === 'VERIFIED' && <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                                        {status === 'REJECTED' && <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                                        {status === 'ALL' && <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />}
                                        {status.charAt(0) + status.slice(1).toLowerCase()}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-[250px] glass-dark rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredAthletes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAthletes.map(athlete => (
                                    <PlayerCard
                                        key={athlete.id}
                                        athlete={athlete}
                                        onVerify={handleVerify}
                                        onReject={handleReject}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                                    <Filter className="w-8 h-8 text-gray-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-1">No athletes found</h3>
                                <p className="text-gray-400">Try adjusting your filters or search query.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifierDashboard;
