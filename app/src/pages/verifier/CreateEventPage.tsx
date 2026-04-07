import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Shield, Calendar, MapPin, Trophy, Users, Info, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const SPORTS = ['Athletics', 'Basketball', 'Cricket', 'Badminton', 'Football', 'Kabaddi', 'Swimming', 'Volleyball', 'Wrestling', 'Other'];
const LEVELS = ['District', 'Interclg', 'University', 'State', 'Khelo India', 'National'];
const EMOJIS = ['🏃', '🏀', '🏸', '⚽', '🏊', '🤼', '🏐', '🎾', '🏓', '🏏'];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    sport: 'Athletics',
    level: 'District',
    type: 'Outdoor',
    format: 'Solo',
    gender: 'Open',
    venue: '',
    city: '',
    state: 'Maharashtra',
    description: '',
    start_date: '',
    end_date: '',
    deadline: '',
    max_participants: 100,
    prize: '',
    image_emoji: '🏃'
  });

  if (!user || (user.role !== 'verifier' && user.role !== 'admin')) {
    return <div className="min-h-screen bg-[#0f172a] text-white p-20 text-center">Unauthorized</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.title || !formData.venue || !formData.start_date || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: `evt_${Date.now()}`,
          created_by: user.email,
          created_by_role: 'admin',
          registrations: [],
          registered_count: 0,
          approval_status: 'APPROVED'
        })
      });

      if (!response.ok) throw new Error('Failed to create event');

      toast.success('🎉 Event created successfully!');
      navigate('/verifier/events');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-lime-400/20 rounded-xl flex items-center justify-center border border-lime-400/30">
            <Shield className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Create Official Event</h1>
            <p className="text-gray-500 font-medium">Add a verified tournament directly to the platform database.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section 1: Basic Info */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-blue-400" /> Basic Information
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Event Title *</label>
              <Input 
                className="bg-black/20 border-white/10 h-12 rounded-xl focus:border-lime-400/50"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Maharashtra State Open"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Sport *</label>
                <select 
                  className="w-full bg-black/20 border border-white/10 h-12 rounded-xl px-3 text-sm focus:border-lime-400/50 outline-none"
                  value={formData.sport}
                  onChange={e => setFormData({...formData, sport: e.target.value})}
                >
                  {SPORTS.map(s => <option key={s} value={s} className="bg-[#1e293b]">{s}</option>)}
                  <option value="Kabaddi" className="bg-[#1e293b]">Kabaddi</option>
                  <option value="Volleyball" className="bg-[#1e293b]">Volleyball</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Level *</label>
                <select 
                  className="w-full bg-black/20 border border-white/10 h-12 rounded-xl px-3 text-sm focus:border-lime-400/50 outline-none"
                  value={formData.level}
                  onChange={e => setFormData({...formData, level: e.target.value})}
                >
                  {LEVELS.map(l => <option key={l} value={l} className="bg-[#1e293b]">{l}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Type</label>
                <div className="flex flex-col gap-1">
                  {['Indoor', 'Outdoor'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({...formData, type: t})}
                      className={`text-[10px] py-1 rounded-md font-bold transition-all ${formData.type === t ? 'bg-lime-400 text-[#0f172a]' : 'text-gray-400'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Format</label>
                <div className="flex flex-col gap-1">
                  {['Solo', 'Duo', 'Team'].map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormData({...formData, format: f})}
                      className={`text-[10px] py-1 rounded-md font-bold transition-all ${formData.format === f ? 'bg-lime-400 text-[#0f172a]' : 'text-gray-400'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Gender</label>
                <div className="flex flex-col gap-1">
                  {['Open', 'Women', 'Mixed'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({...formData, gender: g})}
                      className={`text-[10px] py-1 rounded-md font-bold transition-all ${formData.gender === g ? 'bg-lime-400 text-[#0f172a]' : 'text-gray-400'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Logistics */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-red-400" /> Logistics & Schedule
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Venue Name *</label>
                <Input 
                  className="bg-black/20 border-white/10 h-11 rounded-xl focus:border-lime-400/50"
                  value={formData.venue}
                  onChange={e => setFormData({...formData, venue: e.target.value})}
                  placeholder="e.g. Shivaji Sports Complex"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">City *</label>
                  <Input 
                    className="bg-black/20 border-white/10 h-11 rounded-xl focus:border-lime-400/50"
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">State *</label>
                  <Input 
                    className="bg-black/20 border-white/10 h-11 rounded-xl focus:border-lime-400/50"
                    value={formData.state}
                    onChange={e => setFormData({...formData, state: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1.5 line-clamp-1">
                  <Calendar className="w-3.5 h-3.5" /> Start Date*
                </label>
                <Input 
                  type="datetime-local"
                  className="bg-black/20 border-white/10 h-11 rounded-xl focus:border-lime-400/50 block text-xs"
                  value={formData.start_date}
                  onChange={e => setFormData({...formData, start_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1.5 line-clamp-1">
                  <Calendar className="w-3.5 h-3.5" /> End Date*
                </label>
                <Input 
                  type="datetime-local"
                  className="bg-black/20 border-white/10 h-11 rounded-xl focus:border-lime-400/50 block text-xs"
                  value={formData.end_date}
                  onChange={e => setFormData({...formData, end_date: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-orange-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Registration Deadline *
              </label>
              <Input 
                type="datetime-local"
                className="bg-black/20 border-orange-400/20 h-11 rounded-xl focus:border-orange-400/50 block text-xs"
                value={formData.deadline}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>

          {/* Section 3: Extra Details */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-500" /> Rewards & Capacity
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Prize Details</label>
                    <Input 
                      className="bg-black/20 border-white/10 h-11 rounded-xl focus:border-lime-400/50"
                      value={formData.prize}
                      onChange={e => setFormData({...formData, prize: e.target.value})}
                      placeholder="e.g. Trophy + ₹10k"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Capacity
                    </label>
                    <Input 
                      type="number"
                      className="bg-black/20 border-white/10 h-11 rounded-xl focus:border-lime-400/50"
                      value={formData.max_participants}
                      onChange={e => setFormData({...formData, max_participants: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Pick an Emoji Icon</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({...formData, image_emoji: emoji})}
                        className={`w-10 h-10 text-xl rounded-xl border transition-all ${formData.image_emoji === emoji ? 'bg-lime-400/20 border-lime-400 translate-y-[-2px]' : 'bg-white/5 border-white/10'}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Event Description</label>
                 <textarea 
                   className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm h-[180px] focus:border-lime-400/50 outline-none resize-none"
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   placeholder="Describe your event, rules, eligibility..."
                 />
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
              <Button 
                type="submit"
                disabled={loading}
                className="bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-black h-14 px-12 rounded-2xl text-lg shadow-xl shadow-lime-400/20 transition-all active:scale-95"
              >
                {loading ? 'Creating...' : (
                  <>
                    <Save className="w-5 h-5 mr-3" />
                    CREATE EVENT
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

