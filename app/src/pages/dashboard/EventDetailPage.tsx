import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, Trophy, Clock, Share2, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import RegistrationFormModal from '@/components/RegistrationFormModal';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, loading, cancelRegistration } = useEvents();

  const [showModal, setShowModal] = useState(false);
  const [regStatus, setRegStatus] = useState<string | null>(null);

  const event = events.find(e => e.id === id);

  useEffect(() => {
    if (user && event?.registrations) {
      const reg = event.registrations.find((r: any) =>
        (typeof r === 'string' ? r : r.athleteEmail) === user.email
      );
      if (reg) {
        setRegStatus(typeof reg === 'string' ? 'APPROVED' : reg.reg_status);
      } else {
        setRegStatus(null);
      }
    }
  }, [user, event?.registrations]);

  const handleCancel = async () => {
    if (!id || !user) return;
    await cancelRegistration(id, user.email);
  };

  const shareEvent = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <Spinner className="w-10 h-10 text-lime-400" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <Shield className="w-10 h-10 text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Event Not Found</h1>
        <p className="text-gray-400 mb-8">This event might have been removed or the link is incorrect.</p>
        <Button onClick={() => navigate('/events')} className="bg-lime-400 text-[#0f172a] font-bold">
          Back to Discovery
        </Button>
      </div>
    );
  }

  const now = new Date();
  const deadline = new Date(event.deadline);
  const diffHours = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
  const isFull = event.registered_count >= event.max_participants;
  const registrationClosed = diffHours < 0;

  const renderActionButton = () => {
    if (regStatus === 'APPROVED') {
      return (
        <div className="space-y-3">
          <Button className="w-full bg-green-500/20 text-green-400 border border-green-500/30 font-black h-14 text-lg cursor-default">
            <CheckCircle className="w-5 h-5 mr-3" />
            CONFIRMED
          </Button>
          <button
            onClick={handleCancel}
            className="w-full text-red-500 hover:text-red-400 text-sm font-bold transition-colors"
          >
            Cancel Registration?
          </button>
        </div>
      );
    }
    if (regStatus === 'PENDING') {
      return (
        <div className="space-y-3">
          <Button className="w-full bg-orange-400/20 text-orange-400 border border-orange-400/30 font-black h-14 text-lg cursor-default">
            ⏳ PENDING APPROVAL
          </Button>
          <button
            onClick={handleCancel}
            className="w-full text-red-500 hover:text-red-400 text-sm font-bold transition-colors"
          >
            Cancel Registration?
          </button>
        </div>
      );
    }
    if (regStatus === 'REJECTED') {
      return (
        <Button className="w-full bg-red-500/20 text-red-400 border border-red-500/30 font-black h-14 text-lg cursor-default">
          ❌ NOT SELECTED
        </Button>
      );
    }
    if (registrationClosed) {
      return (
        <Button disabled className="w-full bg-white/5 text-gray-500 font-black h-14 text-lg cursor-not-allowed">
          Registration Closed
        </Button>
      );
    }
    if (isFull) {
      return (
        <Button className="w-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-black h-14 text-lg">
          Join Waitlist
        </Button>
      );
    }
    return (
      <Button
        onClick={() => setShowModal(true)}
        className="w-full bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-black h-14 text-lg shadow-xl shadow-lime-400/20 transition-all active:scale-95"
      >
        REGISTER FOR THIS EVENT
      </Button>
    );
  };

  return (
    <>
      <div className="pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/events')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-6">
                <div className="text-7xl bg-white/5 w-24 h-24 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
                  {event.image_emoji}
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight mb-2 leading-tight">
                    {event.title}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-lime-400/10 text-lime-400 px-3 py-1 rounded-full text-xs font-bold border border-lime-400/20">
                      {event.sport}
                    </span>
                    <span className="bg-blue-400/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-400/20">
                      {event.level}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1">
                  <Calendar className="w-5 h-5 text-lime-400 mb-2" />
                  <p className="text-sm text-gray-400">Date & Time</p>
                  <p className="text-lg font-bold">{new Date(event.start_date).toLocaleDateString()} — {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1">
                  <MapPin className="w-5 h-5 text-blue-400 mb-2" />
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-lg font-bold">{event.venue}, {event.city}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-lime-400 pl-4">About this Event</h2>
                <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="bg-[#1e293b] p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 sticky top-24">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                    <span className="text-gray-400 flex items-center gap-2"><Trophy className="w-4 h-4" /> Prize</span>
                    <span className="font-bold text-lime-400">{event.prize}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                    <span className="text-gray-400 flex items-center gap-2"><Users className="w-4 h-4" /> Participants</span>
                    <span className="font-bold">{event.registered_count} / {event.max_participants}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2">
                    <span className="text-gray-400 flex items-center gap-2"><Clock className="w-4 h-4" /> Deadline</span>
                    <span className="font-bold text-orange-400">{new Date(event.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-4">
                  {renderActionButton()}
                </div>

                <button 
                  onClick={shareEvent}
                  className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-white transition-colors py-2 text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Share Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <RegistrationFormModal
          event={event}
          onClose={() => setShowModal(false)}
          onSuccess={() => setRegStatus('PENDING')}
        />
      )}
    </>
  );
}

