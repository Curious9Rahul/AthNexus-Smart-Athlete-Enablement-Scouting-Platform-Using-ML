import { useState, useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/EventCard';
import { Input } from '@/components/ui/input';
import { Search, Filter, Compass, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LEVEL_FILTERS = ['All', 'District', 'Interclg', 'University', 'State', 'Khelo India', 'National', 'Women'];
const TYPE_FILTERS = ['All', 'Indoor', 'Outdoor'];
const FORMAT_FILTERS = ['All', 'Solo', 'Duo', 'Team'];

const EventsPage = () => {
    const navigate = useNavigate();
    const { 
        liveEvents, 
        upcomingEvents, 
        deadlineEvents, 
        loading 
    } = useEvents();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedFormat, setSelectedFormat] = useState('All');

    const filterEventsList = (eventsList: any[]) => {
        return eventsList.filter(event => {
            // Search
            const q = searchQuery.toLowerCase();
            const matchesSearch = 
                event.title.toLowerCase().includes(q) || 
                event.sport.toLowerCase().includes(q) || 
                event.venue.toLowerCase().includes(q) || 
                event.city.toLowerCase().includes(q);
            
            // Level
            const matchesLevel = selectedLevel === 'All' 
                ? true 
                : selectedLevel === 'Women' 
                    ? event.gender === 'Women'
                    : event.level === selectedLevel;

            // Type
            const matchesType = selectedType === 'All' || event.type === selectedType;

            // Format
            const matchesFormat = selectedFormat === 'All' || event.format === selectedFormat;

            return matchesSearch && matchesLevel && matchesType && matchesFormat;
        });
    };

    const filteredLive = useMemo(() => filterEventsList(liveEvents), [liveEvents, searchQuery, selectedLevel, selectedType, selectedFormat]);
    const filteredDeadline = useMemo(() => filterEventsList(deadlineEvents), [deadlineEvents, searchQuery, selectedLevel, selectedType, selectedFormat]);
    const filteredUpcoming = useMemo(() => filterEventsList(upcomingEvents), [upcomingEvents, searchQuery, selectedLevel, selectedType, selectedFormat]);

    const hasNoResults = !loading && filteredLive.length === 0 && filteredDeadline.length === 0 && filteredUpcoming.length === 0;

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 text-lime-400 mb-2">
                    <Compass className="w-5 h-5" />
                    <span className="text-sm font-black tracking-[0.2em] uppercase">Discovery</span>
                </div>
                <h1 className="text-4xl font-black text-white mb-3">Explore Events</h1>
                <p className="text-gray-400 text-lg max-w-2xl">Discover and register for upcoming tournaments, collegiate meets, and state-level championships across India.</p>
            </div>

            {/* Filter Card */}
            <div className="bg-[#1e293b] border border-white/10 p-8 rounded-3xl mb-12 relative overflow-hidden shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Search */}
                    <div className="lg:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Search Events</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input 
                                placeholder="Search by title, sport, venue..." 
                                className="pl-12 h-14 bg-black/20 border-white/10 text-white rounded-2xl focus:border-lime-400/50 transition-all text-base"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Level */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Level / Category</label>
                        <select 
                            className="w-full h-14 bg-black/20 border border-white/10 text-white rounded-2xl px-4 outline-none focus:border-lime-400/50 transition-all appearance-none cursor-pointer"
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                        >
                            {LEVEL_FILTERS.map(l => <option key={l} value={l} className="bg-[#1e293b]">{l}</option>)}
                        </select>
                    </div>

                    {/* Type & Format Combo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Type</label>
                            <select 
                                className="w-full h-14 bg-black/20 border border-white/10 text-white rounded-2xl px-3 outline-none focus:border-lime-400/50 transition-all appearance-none cursor-pointer text-sm"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                {TYPE_FILTERS.map(t => <option key={t} value={t} className="bg-[#1e293b]">{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Format</label>
                            <select 
                                className="w-full h-14 bg-black/20 border border-white/10 text-white rounded-2xl px-3 outline-none focus:border-lime-400/50 transition-all appearance-none cursor-pointer text-sm"
                                value={selectedFormat}
                                onChange={(e) => setSelectedFormat(e.target.value)}
                            >
                                {FORMAT_FILTERS.map(f => <option key={f} value={f} className="bg-[#1e293b]">{f}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <p className="text-xs text-gray-500 italic">
                        All times shown are in IST. Registration approvals are handled by verified organizers.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/create-event')}
                        className="group flex items-center gap-3 px-6 py-3 bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-black rounded-2xl transition-all shadow-xl shadow-lime-400/20 active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        SUBMIT YOUR EVENT
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[300px] bg-white/5 rounded-xl border border-white/10 animate-pulse" />
                    ))}
                </div>
            ) : hasNoResults ? (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <Filter className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
                    <p className="text-gray-400 max-w-md mx-auto">We couldn't find any events matching your current filters. Try adjusting your search or clearing the filters.</p>
                    <button 
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedLevel('All');
                            setSelectedType('All');
                            setSelectedFormat('All');
                        }}
                        className="mt-6 text-lime-400 font-semibold hover:text-lime-300"
                    >
                        Clear All Filters
                    </button>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* LIVE EVENTS */}
                    {filteredLive.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-2xl">🔴</span>
                                <h2 className="text-2xl font-bold text-white tracking-tight">LIVE EVENTS RIGHT NOW</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredLive.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* DEADLINE NEARBY */}
                    {filteredDeadline.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-2xl">⏰</span>
                                <h2 className="text-2xl font-bold text-white tracking-tight">DEADLINE NEARBY (72H)</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredDeadline.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* UPCOMING EVENTS */}
                    {filteredUpcoming.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-2xl">📅</span>
                                <h2 className="text-2xl font-bold text-white tracking-tight">ALL UPCOMING EVENTS</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredUpcoming.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventsPage;
