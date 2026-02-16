import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Trophy, Filter, ArrowRight, Clock } from 'lucide-react';

const EventsIntelligence = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Events' },
    { id: 'inter-college', label: 'Inter-College' },
    { id: 'zonal', label: 'Zonal' },
    { id: 'state', label: 'State' },
    { id: 'national', label: 'National' },
  ];

  const events = [
    {
      name: 'Ojus Sports 2K26',
      level: 'Inter-College',
      type: 'Team',
      gender: 'Mixed',
      date: 'Feb 15-20, 2026',
      venue: 'College Ground',
      players: 120,
      status: 'Upcoming',
      sports: ['Cricket', 'Football', 'Basketball'],
    },
    {
      name: 'Mumbai University Cricket',
      level: 'Zonal',
      type: 'Team',
      gender: 'Boys',
      date: 'Mar 5-12, 2026',
      venue: 'University Stadium',
      players: 84,
      status: 'Registration Open',
      sports: ['Cricket'],
    },
    {
      name: 'Maharashtra State Athletics',
      level: 'State',
      type: 'Solo',
      gender: 'Mixed',
      date: 'Apr 1-5, 2026',
      venue: 'State Sports Complex',
      players: 200,
      status: 'Coming Soon',
      sports: ['Athletics'],
    },
    {
      name: 'Khelo India Youth Games',
      level: 'National',
      type: 'Mixed',
      gender: 'Mixed',
      date: 'May 10-25, 2026',
      venue: 'Multiple Venues',
      players: 500,
      status: 'Coming Soon',
      sports: ['Multiple Sports'],
    },
  ];

  const teamSports = ['Football', 'Cricket', 'Kabaddi', 'Volleyball', 'Basketball', 'Hockey'];
  const soloSports = ['Athletics', 'Badminton', 'Table Tennis', 'Chess', 'Swimming', 'Boxing'];

  return (
    <section id="events" className="relative py-24 bg-[#0f172a]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">Events Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Smart <span className="text-lime-400">Event Management</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl">
              Discover, filter, and participate in events across all levels. 
              From inter-college to national competitions.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <div className="flex items-center gap-2 mr-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Filter by:</span>
          </div>
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter.id
                  ? 'bg-lime-400 text-[#0f172a]'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {events.map((event, index) => (
            <div
              key={index}
              className="group bg-[#1e293b] rounded-2xl border border-white/5 hover:border-lime-400/30 transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg group-hover:text-lime-400 transition-colors">
                      {event.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400 text-sm">{event.venue}</span>
                    </div>
                  </div>
                  <Badge className={`${
                    event.status === 'Upcoming' ? 'bg-blue-500/20 text-blue-400' :
                    event.status === 'Registration Open' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {event.status}
                  </Badge>
                </div>

                {/* Details */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                    {event.level}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-gray-300">
                    {event.type}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-gray-300">
                    {event.gender}
                  </Badge>
                </div>

                {/* Sports */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.sports.map((sport, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300"
                    >
                      {sport}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400 text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400 text-sm">{event.players} players</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-lime-400 hover:text-lime-500 hover:bg-lime-400/10"
                  >
                    View Details
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sports Categories */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Team Sports */}
          <div className="bg-[#1e293b] rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="text-white font-semibold">Team Sports</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {teamSports.map((sport) => (
                <span
                  key={sport}
                  className="px-3 py-1.5 bg-white/5 hover:bg-blue-500/20 rounded-lg text-sm text-gray-300 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {sport}
                </span>
              ))}
            </div>
          </div>

          {/* Solo Sports */}
          <div className="bg-[#1e293b] rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-400" />
              </div>
              <h4 className="text-white font-semibold">Solo Sports</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {soloSports.map((sport) => (
                <span
                  key={sport}
                  className="px-3 py-1.5 bg-white/5 hover:bg-orange-500/20 rounded-lg text-sm text-gray-300 hover:text-orange-400 transition-colors cursor-pointer"
                >
                  {sport}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button
            size="lg"
            className="bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-semibold px-8"
          >
            View All Upcoming Events
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsIntelligence;
