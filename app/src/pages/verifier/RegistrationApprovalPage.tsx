import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { UserCircle, Check, Clock, Shield, ChevronDown, ChevronUp, X, Paperclip, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEvents } from '@/hooks/useEvents';
import { Spinner } from '@/components/ui/spinner';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface RegistrationRecord {
  eventId: string;
  eventTitle: string;
  athleteId: string | number;
  athleteName: string;
  athleteEmail: string;
  registeredAt: string;
  reg_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reject_reason?: string;
  processedAt?: string;
  formData?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────
// FormDataPanel — shared by inline expand + modal
// ─────────────────────────────────────────────────────────────
function FormDataTable({ formData }: { formData: Record<string, string> | undefined }) {
  const entries = formData ? Object.entries(formData) : [];

  if (entries.length === 0) {
    return (
      <p className="text-xs text-gray-600 italic py-2">
        No form details available for this registration.
      </p>
    );
  }

  const isFileField = (label: string) =>
    label.toLowerCase().includes('upload') ||
    label.toLowerCase().includes('proof') ||
    label.toLowerCase().includes('file');

  return (
    <div>
      {entries.map(([label, value], i) => {
        const isLast = i === entries.length - 1;
        const isFile = isFileField(label);
        const isEmpty = !value || value.trim() === '';

        return (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '8px 0',
              borderBottom: isLast ? 'none' : '1px solid #1e2e40',
            }}
          >
            <div style={{ width: 140, minWidth: 140, color: '#5a8aaa', fontSize: 13, lineHeight: 1.4 }}>
              {label}
            </div>
            <div style={{ flex: 1, color: isEmpty ? '#3a5a7a' : '#e0eaf5', fontSize: 13, fontWeight: 500, lineHeight: 1.4, wordBreak: 'break-word' }}>
              {isEmpty ? (
                '—'
              ) : isFile ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Paperclip size={12} color="#5a8aaa" />
                  {value}
                  <span style={{
                    fontSize: 9, fontWeight: 700, background: 'rgba(132,204,22,0.1)',
                    color: '#84cc16', border: '1px solid rgba(132,204,22,0.2)',
                    borderRadius: 4, padding: '1px 5px', textTransform: 'uppercase', letterSpacing: '0.06em'
                  }}>
                    Uploaded
                  </span>
                </span>
              ) : (
                value
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Details Modal (for processed registrations)
// ─────────────────────────────────────────────────────────────
function DetailsModal({ reg, onClose }: { reg: RegistrationRecord; onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  const statusColor = reg.reg_status === 'APPROVED'
    ? { bg: 'rgba(132,204,22,0.1)', text: '#84cc16', border: 'rgba(132,204,22,0.25)' }
    : { bg: 'rgba(239,68,68,0.1)', text: '#f87171', border: 'rgba(239,68,68,0.25)' };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      style={{ animation: 'fadeIn 0.15s ease both' }}
    >
      <div
        className="w-full max-w-md flex flex-col"
        style={{
          background: '#111a28',
          border: '1px solid #1e2e40',
          borderRadius: 16,
          maxHeight: '85vh',
          animation: 'slideUp 0.2s ease both',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Modal Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2e40', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={{ color: '#4a7a9a', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                Registration Details
              </p>
              <h2 style={{ color: '#e0eaf5', fontSize: 16, fontWeight: 800, lineHeight: 1.3, marginBottom: 6 }}>
                {reg.athleteName}
                <span style={{ color: '#5a8aaa', fontWeight: 500 }}> — {reg.eventTitle}</span>
              </h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                background: statusColor.bg, border: `1px solid ${statusColor.border}`,
                borderRadius: 6, padding: '3px 9px' }}>
                <span style={{ color: statusColor.text, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {reg.reg_status === 'APPROVED' ? '✅ Approved' : '❌ Rejected'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a8aaa', padding: 4, borderRadius: 6, flexShrink: 0 }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto' }}>
          <FormDataTable formData={reg.formData} />
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
const RegistrationApprovalPage = () => {
  const { approveRegistration, rejectRegistration } = useEvents();
  const [allRegs, setAllRegs] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingKey, setRejectingKey] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Which card's details are expanded (one at a time)
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  // Modal state for processed registrations
  const [modalReg, setModalReg] = useState<RegistrationRecord | null>(null);

  const fetchAllRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/events');
      if (response.ok) {
        const events = await response.json();
        const flattened: RegistrationRecord[] = [];
        events.forEach((evt: {
          id: string;
          title: string;
          registrations?: {
            athleteId: string | number;
            athleteName: string;
            athleteEmail: string;
            registeredAt: string;
            reg_status: 'PENDING' | 'APPROVED' | 'REJECTED';
            reject_reason?: string;
            processedAt?: string;
            formData?: Record<string, string>;
          }[];
        }) => {
          if (evt.registrations && Array.isArray(evt.registrations)) {
            evt.registrations.forEach(reg => {
              flattened.push({
                eventId: evt.id,
                eventTitle: evt.title,
                athleteId: reg.athleteId,
                athleteName: reg.athleteName,
                athleteEmail: reg.athleteEmail,
                registeredAt: reg.registeredAt,
                reg_status: reg.reg_status || 'APPROVED',
                reject_reason: reg.reject_reason,
                processedAt: reg.processedAt,
                formData: reg.formData,
              });
            });
          }
        });
        setAllRegs(flattened.sort((a, b) =>
          new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
        ));
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllRegistrations(); }, [fetchAllRegistrations]);

  const pendingRegs = useMemo(() => allRegs.filter(r => r.reg_status === 'PENDING'), [allRegs]);
  const processedRegs = useMemo(() => allRegs.filter(r => r.reg_status !== 'PENDING'), [allRegs]);

  const handleApprove = async (eventId: string, athleteId: string | number) => {
    const key = `${eventId}-${athleteId}`;
    setIsProcessing(key);
    const success = await approveRegistration(eventId, athleteId);
    if (success) {
      toast.success('Registration approved!');
      
      // Trigger Credential Issuance Backend Call
      try {
        const reg = pendingRegs.find(r => r.eventId === eventId && r.athleteId === athleteId);
        if (reg) {
           await fetch('http://localhost:5000/api/credentials/issue', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               // Needs credentials included to pass JWT
               credentials: 'include',
               body: JSON.stringify({
                   user_id: athleteId,
                   event_id: eventId,
                   event_name: reg.eventTitle,
                   event_date: reg.registeredAt 
               })
           });
           toast.success('Credential processing started');
        }
      } catch (e) {
        console.error('Failed to issue credential', e);
      }

      setExpandedKey(null);
      fetchAllRegistrations();
    }
    setIsProcessing(null);
  };

  const handleReject = async (eventId: string, athleteId: string | number) => {
    if (!rejectReason.trim()) return;
    const key = `${eventId}-${athleteId}`;
    setIsProcessing(key);
    const success = await rejectRegistration(eventId, athleteId, rejectReason);
    if (success) {
      toast.success('Registration rejected.');
      setExpandedKey(null);
      fetchAllRegistrations();
    }
    setRejectingKey(null);
    setRejectReason('');
    setIsProcessing(null);
  };

  const toggleExpand = (key: string) => {
    setExpandedKey(prev => prev === key ? null : key);
  };

  return (
    <div className="pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-lime-400 mb-2">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-black tracking-[0.2em] uppercase">Operations</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Registration Approval</h1>
          <p className="text-gray-400 text-lg max-w-2xl">Review and approve athlete registrations for all active tournaments.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Spinner className="w-10 h-10 text-lime-400" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Synchronizing Database...</p>
          </div>
        ) : (
          <div className="space-y-16">

            {/* ──── PENDING SECTION ──── */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="px-3 py-1 bg-orange-400/20 rounded-full border border-orange-400/30">
                  <span className="text-orange-400 text-xs font-black uppercase tracking-widest">⏳ Pending Approval</span>
                </div>
                <div className="h-px bg-white/5 flex-1" />
              </div>

              {pendingRegs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingRegs.map(reg => {
                    const key = `${reg.eventId}-${reg.athleteId}`;
                    const isExpanded = expandedKey === key;
                    const hasFormData = reg.formData && Object.keys(reg.formData).length > 0;

                    return (
                      <div key={key} className="bg-[#1e293b] border border-white/10 rounded-3xl p-6 hover:border-lime-400/30 transition-all flex flex-col group shadow-xl">
                        {/* Card top: athlete info */}
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-lime-400/10 group-hover:border-lime-400/20 transition-all shrink-0">
                            <UserCircle className="w-7 h-7 text-gray-400 group-hover:text-lime-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-lg text-white truncate leading-none mb-1">{reg.athleteName}</h3>
                            <p className="text-xs text-gray-500 font-medium truncate">{reg.athleteEmail}</p>
                          </div>
                        </div>

                        {/* Event info */}
                        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 mb-4">
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1.5">Requesting For</p>
                          <h4 className="font-bold text-lime-400 text-sm line-clamp-2 mb-3">{reg.eventTitle}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-tighter">
                            <Clock className="w-3 h-3" />
                            Submitted: {new Date(reg.registeredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {/* ── Toggle button ── */}
                        <button
                          onClick={() => toggleExpand(key)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 0',
                            color: '#5a8aaa',
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 6,
                            textAlign: 'left',
                          }}
                        >
                          {isExpanded
                            ? <><ChevronUp size={14} /> Hide Details</>
                            : <><ChevronDown size={14} /> View Registration Details</>
                          }
                        </button>

                        {/* ── Expandable details panel ── */}
                        <div style={{
                          maxHeight: isExpanded ? 500 : 0,
                          overflow: 'hidden',
                          transition: 'max-height 0.3s ease',
                          marginBottom: isExpanded ? 12 : 0,
                        }}>
                          <div style={{
                            background: '#0a1018',
                            border: '1px solid #1e2e40',
                            borderRadius: 8,
                            padding: '14px 16px',
                          }}>
                            <p style={{
                              color: '#4a7a9a',
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: '0.07em',
                              textTransform: 'uppercase',
                              marginBottom: 12,
                            }}>
                              Registration Form Details
                            </p>
                            {hasFormData ? (
                              <FormDataTable formData={reg.formData} />
                            ) : (
                              <p style={{ color: '#3a5a7a', fontSize: 12, fontStyle: 'italic' }}>
                                No form details available for this registration.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* ── Approve / Reject ── */}
                        <div className="space-y-3 mt-auto">
                          {rejectingKey === key ? (
                            <div className="animate-in fade-in zoom-in-95 duration-200">
                              <textarea
                                placeholder="Reason for rejection..."
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-xs text-white mb-2 focus:outline-none focus:border-red-500/50 min-h-[80px] resize-none"
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button
                                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black text-[10px] h-9 rounded-xl"
                                  disabled={isProcessing === key || !rejectReason.trim()}
                                  onClick={() => handleReject(reg.eventId, reg.athleteId)}
                                >
                                  {isProcessing === key ? <Spinner className="w-4 h-4" /> : 'CONFIRM REJECT'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="px-4 text-gray-500 hover:text-white text-[10px] font-black"
                                  onClick={() => { setRejectingKey(null); setRejectReason(''); }}
                                >
                                  CANCEL
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                className="flex-1 bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-black text-xs h-12 rounded-2xl shadow-lg shadow-lime-400/10 active:scale-95"
                                disabled={isProcessing === key}
                                onClick={() => handleApprove(reg.eventId, reg.athleteId)}
                              >
                                {isProcessing === key ? <Spinner className="w-4 h-4" /> : '✅ APPROVE'}
                              </Button>
                              <Button
                                variant="outline"
                                className="border-white/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 font-black text-xs h-12 rounded-2xl active:scale-95"
                                disabled={isProcessing === key}
                                onClick={() => setRejectingKey(key)}
                              >
                                ❌ REJECT
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-12 text-center">
                  <div className="w-16 h-16 bg-lime-400/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-lime-400/30">
                    <Check className="w-8 h-8 text-lime-400" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-1">Queue is Clear</h3>
                  <p className="text-gray-500 font-medium">No athletes are currently waiting for approval.</p>
                </div>
              )}
            </section>

            {/* ──── PROCESSED SECTION ──── */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <span className="text-gray-500 text-xs font-black uppercase tracking-widest">✅ Processed Registrations</span>
                </div>
                <div className="h-px bg-white/5 flex-1" />
              </div>

              <div className="bg-[#1e293b] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/20 border-b border-white/5">
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Athlete</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Event</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Processed On</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {processedRegs.length > 0 ? processedRegs.map(reg => (
                        <tr key={`${reg.eventId}-${reg.athleteId}`} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <UserCircle className="w-4 h-4 text-gray-500" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white leading-none mb-1">{reg.athleteName}</p>
                                <p className="text-[10px] text-gray-500 font-medium truncate max-w-[150px]">{reg.athleteEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm font-medium text-gray-300 line-clamp-1">{reg.eventTitle}</p>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                              reg.reg_status === 'APPROVED'
                                ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
                                : 'bg-red-400/10 text-red-400 border border-red-400/20'
                            }`}>
                              {reg.reg_status}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <p className="text-xs font-bold text-gray-500">
                              {new Date(reg.processedAt || reg.registeredAt).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <button
                              onClick={() => setModalReg(reg)}
                              className="flex items-center gap-1.5 mx-auto text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider"
                            >
                              <Eye size={13} />
                              View →
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium italic">
                            No processed registrations found in history.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {modalReg && (
        <DetailsModal reg={modalReg} onClose={() => setModalReg(null)} />
      )}
    </div>
  );
};

export default RegistrationApprovalPage;

