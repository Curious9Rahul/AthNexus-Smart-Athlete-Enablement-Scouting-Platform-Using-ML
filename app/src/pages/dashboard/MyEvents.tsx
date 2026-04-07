import { Calendar, MapPin, Users, UserCheck, Shield, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockRegisteredEvents = [
    {
        id: '1',
        name: 'Inter-College Basketball Championship',
        sport: 'Basketball',
        status: 'confirmed' as const,
        date: '2026-03-15',
        venue: 'Sports Complex Arena',
        matchTime: '10:00 AM',
        team: [
            { id: '1', name: 'John Athlete', role: 'Captain' },
            { id: '2', name: 'Mike Johnson', role: 'Player' },
            { id: '3', name: 'Sarah Williams', role: 'Player' },
            { id: '4', name: 'Tom Brown', role: 'Player' },
            { id: '5', name: 'Lisa Davis', role: 'Player' },
        ],
        substitutes: [
            { id: '6', name: 'Alex Wilson' },
            { id: '7', name: 'Chris Taylor' },
        ],
        faculty: {
            name: 'Dr. Robert Smith',
            email: 'robert.smith@college.edu',
            phone: '+1 234-567-8900',
        },
    },
    {
        id: '2',
        name: 'Summer Football League',
        sport: 'Football',
        status: 'pending' as const,
        date: '2026-03-20',
        venue: 'Main Stadium',
        matchTime: '2:00 PM',
        team: [
            { id: '1', name: 'John Athlete', role: 'Player' },
            { id: '8', name: 'David Martinez', role: 'Captain' },
            { id: '9', name: 'Emily White', role: 'Player' },
        ],
        substitutes: [
            { id: '10', name: 'James Anderson' },
        ],
        faculty: {
            name: 'Prof. Jennifer Lee',
            email: 'jennifer.lee@college.edu',
            phone: '+1 234-567-8901',
        },
    },
];

interface MyEventsProps {
    onNavigate?: (view: 'overview' | 'events' | 'my-events' | 'analytics' | 'profile' | 'profile-edit') => void;
}

const MyEvents = ({ onNavigate }: MyEventsProps) => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Events</h1>
                <p className="text-gray-400">Track your registered events and team information</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-dark rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Events</p>
                            <p className="text-2xl font-bold text-white mt-1">{mockRegisteredEvents.length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-lime-400/20 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-lime-400" />
                        </div>
                    </div>
                </div>

                <div className="glass-dark rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Confirmed</p>
                            <p className="text-2xl font-bold text-white mt-1">
                                {mockRegisteredEvents.filter(e => e.status === 'confirmed').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="glass-dark rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Pending</p>
                            <p className="text-2xl font-bold text-white mt-1">
                                {mockRegisteredEvents.filter(e => e.status === 'pending').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-orange-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Events List */}
            <div className="space-y-6">
                {mockRegisteredEvents.map((event) => (
                    <div
                        key={event.id}
                        className="glass-dark rounded-xl p-6 border border-white/10 space-y-6"
                    >
                        {/* Event Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-white">{event.name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${event.status === 'confirmed'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-orange-500/20 text-orange-400'
                                        }`}>
                                        {event.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                                    </span>
                                </div>
                                <span className="inline-block px-3 py-1 bg-lime-400/20 text-lime-400 text-xs font-semibold rounded-full">
                                    {event.sport}
                                </span>
                            </div>
                        </div>

                        {/* Event Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left Column */}
                            <div className="space-y-3">
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
                                    <Clock className="w-4 h-4 text-lime-400" />
                                    <span className="text-sm">{event.matchTime}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <MapPin className="w-4 h-4 text-lime-400" />
                                    <span className="text-sm">{event.venue}</span>
                                </div>
                            </div>

                            {/* Right Column - Faculty Info */}
                            <div className="glass rounded-lg p-4 space-y-2">
                                <div className="flex items-center gap-2 text-white font-semibold mb-2">
                                    <Shield className="w-4 h-4 text-lime-400" />
                                    <span className="text-sm">Faculty Coordinator</span>
                                </div>
                                <p className="text-white text-sm font-medium">{event.faculty.name}</p>
                                <div className="flex items-center gap-2 text-gray-400 text-xs">
                                    <Mail className="w-3 h-3" />
                                    <span>{event.faculty.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-xs">
                                    <Phone className="w-3 h-3" />
                                    <span>{event.faculty.phone}</span>
                                </div>
                            </div>
                        </div>

                        {/* Team Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-white font-semibold">
                                <Users className="w-5 h-5 text-lime-400" />
                                <span>Team Members ({event.team.length})</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {event.team.map((member) => (
                                    <div
                                        key={member.id}
                                        className="glass rounded-lg p-3 text-center"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-lime-400/20 flex items-center justify-center mx-auto mb-2">
                                            <UserCheck className="w-5 h-5 text-lime-400" />
                                        </div>
                                        <p className="text-white text-sm font-medium">{member.name}</p>
                                        <p className="text-gray-400 text-xs mt-1">{member.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Substitutes Section */}
                        {event.substitutes.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-white font-semibold">
                                    <Users className="w-5 h-5 text-orange-400" />
                                    <span>Substitutes ({event.substitutes.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {event.substitutes.map((sub) => (
                                        <div
                                            key={sub.id}
                                            className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-2"
                                        >
                                            <p className="text-orange-400 text-sm font-medium">{sub.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-white/10">
                            <Button className="bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-semibold">
                                View Details
                            </Button>
                            <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                                Withdraw
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {mockRegisteredEvents.length === 0 && (
                <div className="glass-dark rounded-xl p-12 text-center border border-white/10">
                    <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Events Yet</h3>
                    <p className="text-gray-400 mb-6">You haven't registered for any events</p>
                    <Button 
                        onClick={() => onNavigate && onNavigate('events')}
                        className="bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-semibold"
                    >
                        Browse Events
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MyEvents;

