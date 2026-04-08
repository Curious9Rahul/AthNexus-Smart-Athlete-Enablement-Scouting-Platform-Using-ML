import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export const ProfileSync = () => {
    const { user } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('http://localhost:5000/api/profile/sync-abc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Profile synced from ABC successfully!');
                // Wait briefly and reload to reflect changes
                setTimeout(() => window.location.reload(), 1000);
            } else {
                toast.error(data.error || 'Failed to sync data');
            }
        } catch (e) {
            toast.error('Network error during sync');
        } finally {
            setIsSyncing(false);
        }
    };

    if (!user?.is_abc_verified) return null;

    return (
        <Button 
            onClick={handleSync} 
            disabled={isSyncing}
            variant="outline"
            className="border-white/10 text-gray-400 hover:text-white"
        >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync ABC Data'}
        </Button>
    );
};
