import { Calendar, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockEvents = [
    {
        id: '1',
        name: 'Inter-College Basketball Championship',
        sport: 'Basketball',
        date: '2026-03-15',
        venue: 'Sports Complex Arena',
        registrationDeadline: '2026-03-01',
        skillLevel: 'Advanced',
        slotsAvailable: 12,
        totalSlots: 16,
    },
    {
        id: '2',
        name: 'Summer Football League',
        sport: 'Football',
        date: '2026-03-20',
        venue: 'Main Stadium',
        registrationDeadline: '2026-03-05',
        skillLevel: 'Intermediate',
        slotsAvailable: 8,
        totalSlots: 22,
    },
    {
        id: '3',
        name: 'Annual Athletics Meet',
        sport: 'Athletics',
        date: '2026-04-01',
        venue: 'Track & Field',
        registrationDeadline: '2026-03-15',
        skillLevel: 'Beginner',
        slotsAvailable: 25,
        totalSlots: 30,
    },
    {
        id: '4',
        name: 'Cricket Premier League',
        sport: 'Cricket',
        date: '2026-03-25',
        venue: 'Cricket Ground',
        registrationDeadline: '2026-03-10',
        skillLevel: 'Professional',
        slotsAvailable: 5,
        totalSlots: 11,
    },
];

const Events = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Browse Events</h1>
                <p className="text-gray-400">Find and register for upcoming sports events</p>
            </div>

            {/* Filters */}
            <div className="glass-dark rounded-lg p-4 border border-white/10">
                <div className="flex flex-wrap gap-3">
                    <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm">
                        <option value="">All Sports</option>
                        <option value="basketball">Basketball</option>
                        <option value="football">Football</option>
                        <option value="cricket">Cricket</option>
                        <option value="athletics">Athletics</option>
                    </select>
                    <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm">
                        <option value="">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="professional">Professional</option>
                    </select>
                    <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm">
                        <option value="">Sort by Date</option>
                        <option value="date-asc">Date (Earliest)</option>
                        <option value="date-desc">Date (Latest)</option>
                        <option value="slots">Available Slots</option>
                    </select>
                </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockEvents.map((event) => {
                    const slotsPercentage = (event.slotsAvailable / event.totalSlots) * 100;
                    const isAlmostFull = slotsPercentage < 30;

                    return (
                        <div
                            key={event.id}
                            className="glass-dark rounded-xl p-6 border border-white/10 hover:border-lime-400/50 transition-all hover-lift"
                        >
                            {/* Event Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-1">{event.name}</h3>
                                    <span className="inline-block px-3 py-1 bg-lime-400/20 text-lime-400 text-xs font-semibold rounded-full">
                                        {event.sport}
                                    </span>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${event.skillLevel === 'Beginner' ? 'bg-blue-500/20 text-blue-400' :
                                    event.skillLevel === 'Intermediate' ? 'bg-green-500/20 text-green-400' :
                                        event.skillLevel === 'Advanced' ? 'bg-orange-500/20 text-orange-400' :
                                            'bg-purple-500/20 text-purple-400'
                                    }`}>
                                    {event.skillLevel}
                                </div>
                            </div>

                            {/* Event Details */}
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Calendar className="w-4 h-4 text-lime-400" />
                                    <span className="text-sm">
                                        {new Date(event.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <MapPin className="w-4 h-4 text-lime-400" />
                                    <span className="text-sm">{event.venue}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Users className="w-4 h-4 text-lime-400" />
                                    <span className="text-sm">
                                        {event.slotsAvailable} / {event.totalSlots} slots available
                                    </span>
                                </div>
                            </div>

                            {/* Slots Progress */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                    <span>Registration Progress</span>
                                    <span>{Math.round((event.totalSlots - event.slotsAvailable) / event.totalSlots * 100)}%</span>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${isAlmostFull ? 'bg-red-500' : 'bg-lime-400'
                                            }`}
                                        style={{ width: `${100 - slotsPercentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Deadline Warning */}
                            {new Date(event.registrationDeadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-4">
                                    <p className="text-orange-400 text-xs">
                                        ⚠️ Registration closes on {new Date(event.registrationDeadline).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {/* CTA */}
                            <Button
                                className="w-full bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-semibold"
                                disabled={event.slotsAvailable === 0}
                            >
                                {event.slotsAvailable === 0 ? 'Fully Booked' : 'Register Now'}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Events;
