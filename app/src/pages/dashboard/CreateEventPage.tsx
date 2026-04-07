import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Plus, Trophy, Info } from 'lucide-react';

const EMOJIS = ['🏃', '🏀', '🏸', '⚽', '🏊', '🤼', '🏐', '🏏', '🎾', '🥊', '🎯', '🏋️'];

const CreateEventPage = () => {
    const { user } = useAuth();
    const { createEvent } = useEvents();
    const navigate = useNavigate();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        sport: '',
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
        max_participants: '',
        players_needed: '',
        prize: '',
        image_emoji: '🏃'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        const payload = {
            ...formData,
            max_participants: parseInt(formData.max_participants as string) || 100,
            players_needed: parseInt(formData.players_needed as string) || 0
        };

        const success = await createEvent(payload, user.email, 'athlete');
        setIsSubmitting(false);

        if (success) {
            navigate('/dashboard/my-events');
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 text-lime-400 mb-2">
                    <Plus className="w-5 h-5" />
                    <span className="text-sm font-black tracking-[0.2em] uppercase">Organize</span>
                </div>
                <h1 className="text-4xl font-black text-white mb-3">Create New Event</h1>
                <p className="text-gray-400 text-lg">Organize your own tournament and get matched with verified athletes across the platform.</p>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-600 border border-blue-400 rounded-3xl p-6 flex gap-5 mb-10 shadow-xl shadow-blue-500/10">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                    <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                    <h4 className="text-white font-black text-lg">Review Process Information</h4>
                    <p className="text-blue-50 text-sm leading-relaxed">
                        To maintain high quality, all athlete-created events are manually reviewed by our verifiers. Your event will appear as <strong>Under Review</strong> until approved. Once approved, it will be visible to all athletes for registration.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 md:p-8 space-y-8">
                {/* Basic Details */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-lime-400" /> Basic Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full">
                            <label className="block text-sm font-bold text-gray-400 mb-2">Event Title *</label>
                            <Input 
                                required name="title" value={formData.title} onChange={handleChange} 
                                className="bg-white/5 border-white/10 text-white" placeholder="e.g. District Athletics Championship 2026"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Sport *</label>
                            <select 
                                required name="sport" value={formData.sport} onChange={handleChange}
                                className="w-full h-10 px-3 py-2 bg-[#0f172a] border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                            >
                                <option value="" disabled>Select Sport</option>
                                <option value="Athletics" className="bg-[#1e293b]">Athletics</option>
                                <option value="Basketball" className="bg-[#1e293b]">Basketball</option>
                                <option value="Cricket" className="bg-[#1e293b]">Cricket</option>
                                <option value="Badminton" className="bg-[#1e293b]">Badminton</option>
                                <option value="Football" className="bg-[#1e293b]">Football</option>
                                <option value="Kabaddi" className="bg-[#1e293b]">Kabaddi</option>
                                <option value="Swimming" className="bg-[#1e293b]">Swimming</option>
                                <option value="Volleyball" className="bg-[#1e293b]">Volleyball</option>
                                <option value="Wrestling" className="bg-[#1e293b]">Wrestling</option>
                                <option value="Other" className="bg-[#1e293b]">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Level *</label>
                            <select 
                                required name="level" value={formData.level} onChange={handleChange}
                                className="w-full h-10 px-3 py-2 bg-[#0f172a] border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                            >
                                <option value="District">District</option>
                                <option value="Interclg">Inter-College</option>
                                <option value="University">University</option>
                                <option value="State">State</option>
                                <option value="Khelo India">Khelo India</option>
                                <option value="National">National</option>
                            </select>
                        </div>

                        <div className="col-span-full">
                            <label className="block text-sm font-bold text-gray-400 mb-2">Description</label>
                            <Textarea 
                                name="description" value={formData.description} onChange={handleChange} 
                                className="bg-white/5 border-white/10 text-white min-h-[100px]" placeholder="Tell athletes what this event is about..."
                            />
                        </div>
                    </div>
                </section>

                <div className="h-px bg-white/10" />

                {/* Categories & Type */}
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Type *</label>
                            <div className="flex p-1 bg-[#0f172a] rounded-lg border border-white/10">
                                {['Indoor', 'Outdoor'].map(type => (
                                    <button
                                        type="button" key={type} onClick={() => setFormData(prev => ({ ...prev, type }))}
                                        className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${formData.type === type ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Format *</label>
                            <div className="flex p-1 bg-[#0f172a] rounded-lg border border-white/10">
                                {['Solo', 'Duo', 'Team'].map(format => (
                                    <button
                                        type="button" key={format} onClick={() => setFormData(prev => ({ ...prev, format }))}
                                        className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${formData.format === format ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {format}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Gender *</label>
                            <select 
                                required name="gender" value={formData.gender} onChange={handleChange}
                                className="w-full h-10 px-3 py-2 bg-[#0f172a] border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                            >
                                <option value="Open" className="bg-[#1e293b]">Open (All)</option>
                                <option value="Women" className="bg-[#1e293b]">Women Only</option>
                                <option value="Mixed" className="bg-[#1e293b]">Mixed Teams</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-white/10" />

                {/* Location & Time */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-lime-400" /> Location & Time
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full">
                            <label className="block text-sm font-bold text-gray-400 mb-2">Venue Name *</label>
                            <Input required name="venue" value={formData.venue} onChange={handleChange} className="bg-white/5 border-white/10 text-white" placeholder="e.g. Shivaji Sports Complex" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">City *</label>
                            <Input required name="city" value={formData.city} onChange={handleChange} className="bg-white/5 border-white/10 text-white" placeholder="e.g. Mumbai" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">State *</label>
                            <Input required name="state" value={formData.state} onChange={handleChange} className="bg-white/5 border-white/10 text-white" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Start Date & Time *</label>
                            <Input required type="datetime-local" name="start_date" value={formData.start_date} onChange={handleChange} className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">End Date & Time *</label>
                            <Input required type="datetime-local" name="end_date" value={formData.end_date} onChange={handleChange} className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div className="col-span-full">
                            <label className="block text-sm font-bold text-orange-400 mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" /> Registration Deadline *</label>
                            <Input required type="datetime-local" name="deadline" value={formData.deadline} onChange={handleChange} className="bg-white/5 border-orange-500/30 border text-white" />
                        </div>
                    </div>
                </section>

                <div className="h-px bg-white/10" />

                {/* Extras */}
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Max Participants *</label>
                            <Input required type="number" min="1" name="max_participants" value={formData.max_participants} onChange={handleChange} className="bg-white/5 border-white/10 text-white" placeholder="e.g. 100" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-lime-400 mb-2">Players to Select *</label>
                            <Input required type="number" min="1" name="players_needed" value={formData.players_needed} onChange={handleChange} className="bg-white/5 border-lime-500/30 border text-white" placeholder="e.g. 11" help="Admin will select this many + 2 substitutes" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Prize Details</label>
                            <Input name="prize" value={formData.prize} onChange={handleChange} className="bg-white/5 border-white/10 text-white" placeholder="e.g. Medal + ₹5,000" />
                        </div>
                        <div className="col-span-full mt-4">
                            <label className="block text-sm font-bold text-gray-400 mb-2">Select an Emoji</label>
                            <div className="flex gap-2 p-2 bg-[#0f172a] rounded-lg border border-white/10 overflow-x-auto">
                                {EMOJIS.map(emoji => (
                                    <button
                                        type="button" key={emoji} onClick={() => setFormData(prev => ({ ...prev, image_emoji: emoji }))}
                                        className={`w-10 h-10 rounded-md text-2xl flex items-center justify-center shrink-0 transition-all ${formData.image_emoji === emoji ? 'bg-lime-400/20 border border-lime-400' : 'hover:bg-white/10 border border-transparent'}`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-16 text-lg font-black bg-lime-400 hover:bg-lime-500 text-[#0f172a] shadow-xl shadow-lime-400/20 mt-8 rounded-2xl active:scale-95 transition-all"
                >
                    {isSubmitting ? 'SUBMITTING...' : 'SUBMIT EVENT FOR REVIEW'}
                </Button>
            </form>
        </div>
    );
};

export default CreateEventPage;

