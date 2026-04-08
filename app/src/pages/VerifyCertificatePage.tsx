import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, XCircle, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyCertificatePage() {
    const { credentialId } = useParams();
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetch(`http://localhost:5000/api/verify/${credentialId}`)
            .then(res => res.json())
            .then(res => {
                if (res.valid) {
                    setStatus('valid');
                    setData(res);
                } else {
                    setStatus('invalid');
                }
            })
            .catch(() => setStatus('invalid'));
    }, [credentialId]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#1e293b] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                {status === 'loading' ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-white">Verifying Credential...</h2>
                    </div>
                ) : status === 'valid' ? (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                            <ShieldCheck className="w-10 h-10 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Verified Credential</h2>
                        <p className="text-gray-400 mb-8">This certificate is valid and was issued by the AthNexus Platform.</p>
                        
                        <div className="w-full bg-black/20 rounded-xl p-4 border border-white/5 space-y-4 text-left">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Athlete Name</p>
                                <p className="text-lg font-bold text-white">{data.athlete_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Event Name</p>
                                <p className="text-white">{data.event_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Issued On</p>
                                <p className="text-white">{new Date(data.issued_at).toLocaleString()}</p>
                            </div>
                        </div>

                        <a href={`http://localhost:5000${data.pdf_url}`} target="_blank" className="mt-8 w-full block">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12">
                                <FileText className="w-4 h-4 mr-2" /> View Certificate PDF
                            </Button>
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center py-12">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Invalid Credential</h2>
                        <p className="text-gray-400">We couldn't verify this credential. It may be invalid or not exist in our system.</p>
                    </div>
                )}
                
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
