import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Athlete } from '@/hooks/useAthletes';

interface PlayerCardProps {
    athlete: Athlete & { verificationStatus: string };
    onVerify: (id: number) => void;
    onReject: (id: number) => void;
}

export default function PlayerCard({ athlete, onVerify, onReject }: PlayerCardProps) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold">{athlete.name}</h3>
                    <p className="text-gray-400 text-sm">{athlete.sport} • {athlete.gender}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    athlete.verificationStatus === 'VERIFIED' ? 'bg-green-500/20 text-green-500' :
                    athlete.verificationStatus === 'REJECTED' ? 'bg-red-500/20 text-red-500' :
                    'bg-yellow-500/20 text-yellow-500'
                }`}>
                    {athlete.verificationStatus}
                </div>
            </div>
            
            <div className="flex gap-2 mt-6">
                <Button 
                    onClick={() => onVerify(athlete.id)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white h-9 text-xs"
                    disabled={athlete.verificationStatus === 'VERIFIED'}
                >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Verify
                </Button>
                <Button 
                    onClick={() => onReject(athlete.id)}
                    variant="outline"
                    className="flex-1 border-white/10 hover:bg-red-500/10 hover:text-red-500 h-9 text-xs"
                    disabled={athlete.verificationStatus === 'REJECTED'}
                >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Reject
                </Button>
            </div>
        </div>
    );
}
