import { useState, useEffect, useRef } from 'react';
import { X, Paperclip, AlertCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import type { AppEvent } from '@/hooks/useEvents';
import type { RegistrationField } from '@/types/registration';
import { Spinner } from '@/components/ui/spinner';

interface RegistrationFormModalProps {
  event: AppEvent;
  onClose: () => void;
  onSuccess: () => void;
}

let _accountStatusCache: string | null = null;

export default function RegistrationFormModal({ event, onClose, onSuccess }: RegistrationFormModalProps) {
  const { user } = useAuth();
  const { registerForEvent } = useEvents();
  const backdropRef = useRef<HTMLDivElement>(null);

  const fields: RegistrationField[] = event.registration_fields ?? [];

  // Build initial form state: all field labels mapped to ''
  const initialFormData = fields.reduce<Record<string, string>>((acc, f) => {
    acc[f.label] = '';
    return acc;
  }, {});

  const [formData, setFormData] = useState<Record<string, string>>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountStatus, setAccountStatus] = useState<string>(_accountStatusCache ?? 'ACTIVE');

  // Fetch account status
  useEffect(() => {
    if (user?.role !== 'player' || !user.email) return;
    if (_accountStatusCache !== null) { setAccountStatus(_accountStatusCache); return; }
    fetch('http://localhost:5000/api/admin/users')
      .then(r => r.json())
      .then((users: { email: string; status: string }[]) => {
        const found = users.find(u => u.email === user.email);
        const status = found?.status ?? 'ACTIVE';
        _accountStatusCache = status;
        setAccountStatus(status);
      })
      .catch(() => {});
  }, [user?.email, user?.role]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleChange = (label: string, value: string) => {
    setFormData(prev => ({ ...prev, [label]: value }));
    if (errors[label]) setErrors(prev => { const next = { ...prev }; delete next[label]; return next; });
  };

  const handleFileChange = (label: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleChange(label, file ? file.name : '');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach(f => {
      if (f.required && !formData[f.label]?.trim()) {
        newErrors[f.label] = `${f.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountStatus === 'BANNED' || accountStatus === 'FROZEN') {
      toast.error('Account Restricted. You cannot register for events.');
      return;
    }
    if (!validate() || !user) return;

    setIsSubmitting(true);
    const athleteData = {
      athleteId: user.email,
      athleteName: user.profile?.name || user.email,
      athleteEmail: user.email,
    };

    const success = await registerForEvent(event.id, athleteData, formData);
    setIsSubmitting(false);

    if (success) {
      toast.success('✅ Registration submitted! Awaiting verifier approval.');
      onSuccess();
      onClose();
    }
  };

  const renderField = (field: RegistrationField) => {
    const baseClass =
      'w-full bg-black/30 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all placeholder:text-gray-600 font-medium';
    const borderClass = errors[field.label]
      ? 'border-red-500/60 focus:border-red-400'
      : 'border-white/10 focus:border-lime-400/50';

    switch (field.type) {
      case 'select':
        return (
          <select
            className={`${baseClass} ${borderClass} appearance-none cursor-pointer`}
            value={formData[field.label]}
            onChange={e => handleChange(field.label, e.target.value)}
          >
            <option value="" className="bg-[#1e293b]">Select an option…</option>
            {(field.options ?? []).map(opt => (
              <option key={opt} value={opt} className="bg-[#1e293b]">{opt}</option>
            ))}
          </select>
        );
      case 'file':
        return (
          <label className={`flex items-center gap-3 cursor-pointer ${baseClass} ${borderClass}`}>
            <Paperclip className="w-4 h-4 text-gray-500 shrink-0" />
            <span className={formData[field.label] ? 'text-white' : 'text-gray-600'}>
              {formData[field.label] || 'Choose file…'}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={e => handleFileChange(field.label, e)}
            />
          </label>
        );
      case 'date':
        return (
          <input
            type="date"
            className={`${baseClass} ${borderClass}`}
            value={formData[field.label]}
            onChange={e => handleChange(field.label, e.target.value)}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            placeholder={field.placeholder}
            className={`${baseClass} ${borderClass}`}
            value={formData[field.label]}
            onChange={e => handleChange(field.label, e.target.value)}
          />
        );
      default:
        return (
          <input
            type="text"
            placeholder={field.placeholder}
            className={`${baseClass} ${borderClass}`}
            value={formData[field.label]}
            onChange={e => handleChange(field.label, e.target.value)}
          />
        );
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-6 border-b border-white/10 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10 shrink-0">
                {event.image_emoji}
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Register for</p>
                <h2 className="text-lg font-black text-white leading-tight line-clamp-2">{event.title}</h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  {event.level} · {event.type} · {event.format}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body — scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-5">
            {fields.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No registration form configured for this event.</p>
            ) : (
              fields.map(field => (
                <div key={field.id}>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    {field.label}{field.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                  {errors[field.label] && (
                    <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400 font-medium animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors[field.label]}
                    </p>
                  )}
                </div>
              ))
            )}

            {/* Notice strip */}
            {accountStatus === 'BANNED' || accountStatus === 'FROZEN' ? (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-xs text-red-400 font-medium leading-relaxed">
                  Your account is currently restricted. You cannot submit new registrations at this time.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                <span className="text-base shrink-0">ℹ️</span>
                <p className="text-xs text-blue-300 font-medium leading-relaxed">
                  Your registration will be reviewed by a Verifier before confirmation. You will receive an email once a decision is made.
                </p>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="p-6 pt-0 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 font-black text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || accountStatus === 'BANNED' || accountStatus === 'FROZEN'}
              className="flex-1 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-black text-sm transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="w-4 h-4 text-[#0f172a]" />
                  Submitting…
                </>
              ) : (
                'Submit Registration →'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
