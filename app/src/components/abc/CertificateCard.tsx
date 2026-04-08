import { FileText, Download, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CertificateProps {
    credentialId: string;
    eventName: string;
    eventDate: string;
    pdfUrl: string;
    abcPushStatus: string;
}

export const CertificateCard = ({ credentialId, eventName, eventDate, pdfUrl, abcPushStatus }: CertificateProps) => {
    return (
        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5 flex flex-col hover:border-lime-400/30 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-lime-400" />
                </div>
                {abcPushStatus === 'success' ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">ABC Pushed</span>
                    </div>
                ) : abcPushStatus === 'pending' ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-400/10 border border-orange-400/20">
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Push Pending...</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-400/10 border border-red-400/20">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Push Failed</span>
                    </div>
                )}
            </div>
            
            <h3 className="font-bold text-white text-lg mb-1 leading-tight">{eventName}</h3>
            <p className="text-sm text-gray-400 mb-4">{new Date(eventDate).toLocaleDateString()}</p>
            
            <div className="mt-auto">
                <p className="text-xs text-gray-500 mb-3 truncate" title={credentialId}>ID: {credentialId}</p>
                <a 
                    href={`http://localhost:5000${pdfUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-lg transition-colors border border-white/5"
                >
                    <Download className="w-4 h-4" /> Download Certificate
                </a>
            </div>
        </div>
    );
};
