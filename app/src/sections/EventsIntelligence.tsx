import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { duoSports, soloSports, teamSports } from '@/pages/dashboard/events/data/sportsCatalog';
import { events as allEvents } from '@/pages/dashboard/events/data/events';
import { ArrowRight, Calendar, Clock3, Filter, MapPin, Trophy, Users } from 'lucide-react';

type EventsIntelligenceProps = {
  onSignInClick?: () => void;
};

type LandingFilter = 'all' | 'inter-college' | 'zonal' | 'state' | 'national';

const filters: { id: LandingFilter; label: string }[] = [
  { id: 'all', label: 'All Events' },
  { id: 'inter-college', label: 'Inter-College' },
  { id: 'zonal', label: 'Zonal' },
  { id: 'state', label: 'State' },
  { id: 'national', label: 'National' },
];

const dateLabelFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const monthDayFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
});

const monthDayYearFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const normalizeFilterLevel = (level: string): LandingFilter => {
  if (level === 'District' || level === 'Interclg') {
    return 'inter-college';
  }

  if (level === 'Mumbai University') {
    return 'zonal';
  }

  if (level === 'State') {
    return 'state';
  }

  return 'national';
};

const getParticipationType = (sport: string) => {
  if (teamSports.has(sport)) {
    return 'Team';
  }

  if (duoSports.has(sport)) {
    return 'Duo';
  }

  return soloSports.has(sport) ? 'Solo' : 'Open';
};

const formatDateRange = (startDateText: string, endDateText?: string) => {
  const startDate = new Date(`${startDateText}T00:00:00`);
  const endDate = new Date(`${(endDateText ?? startDateText)}T00:00:00`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return startDateText;
  }

  if (startDateText === endDateText) {
    return dateLabelFormatter.format(startDate);
  }

  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth();

  if (sameMonth) {
    return `${monthDayFormatter.format(startDate)} - ${monthDayYearFormatter.format(endDate)}`;
  }

  if (sameYear) {
    return `${monthDayFormatter.format(startDate)} - ${monthDayYearFormatter.format(endDate)}`;
  }

  return `${dateLabelFormatter.format(startDate)} - ${dateLabelFormatter.format(endDate)}`;
};

const getEventStatus = (submissionDeadline?: string, startDateText?: string, endDateText?: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(`${(startDateText ?? '')}T00:00:00`);
  const endDate = new Date(`${(endDateText ?? startDateText ?? '')}T23:59:59`);
  const deadlineDate = submissionDeadline ? new Date(`${submissionDeadline}T23:59:59`) : null;

  if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && today >= startDate && today <= endDate) {
    return 'Live';
  }

  if (deadlineDate && !Number.isNaN(deadlineDate.getTime()) && today <= deadlineDate) {
    return 'Registration Open';
  }

  if (!Number.isNaN(startDate.getTime()) && today < startDate) {
    return 'Upcoming';
  }

  return 'Completed';
};

const getStatusClasses = (status: string) => {
  if (status === 'Live') {
    return 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/20';
  }

  if (status === 'Registration Open') {
    return 'bg-sky-500/15 text-sky-300 border border-sky-400/20';
  }

  if (status === 'Upcoming') {
    return 'bg-amber-500/15 text-amber-300 border border-amber-400/20';
  }

  return 'bg-white/10 text-gray-300 border border-white/10';
};

const EventsIntelligence = ({ onSignInClick }: EventsIntelligenceProps) => {
  const [activeFilter, setActiveFilter] = useState<LandingFilter>('all');

  const upcomingEvents = useMemo(
    () =>
      allEvents
        .filter((event) => getEventStatus(event.submissionDeadline, event.date, event.tournamentEndDate) !== 'Completed')
        .sort((first, second) => first.date.localeCompare(second.date)),
    []
  );

  const filteredEvents = useMemo(() => {
    const scopedEvents =
      activeFilter === 'all'
        ? upcomingEvents
        : upcomingEvents.filter((event) => normalizeFilterLevel(event.level) === activeFilter);

    return scopedEvents.slice(0, 6);
  }, [activeFilter, upcomingEvents]);

  const featuredSports = useMemo(() => {
    const visibleEvents = activeFilter === 'all'
      ? upcomingEvents
      : upcomingEvents.filter((event) => normalizeFilterLevel(event.level) === activeFilter);

    const uniqueSports = Array.from(new Set(visibleEvents.map((event) => event.sport)));

    return {
      team: uniqueSports.filter((sport) => teamSports.has(sport)).slice(0, 8),
      solo: uniqueSports.filter((sport) => soloSports.has(sport)).slice(0, 8),
    };
  }, [activeFilter, upcomingEvents]);

  const liveCount = useMemo(
    () => upcomingEvents.filter((event) => getEventStatus(event.submissionDeadline, event.date, event.tournamentEndDate) === 'Live').length,
    [upcomingEvents]
  );

  return (
    <section id="events" className="relative overflow-hidden bg-[#0f172a] py-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-lime-400/5 blur-3xl" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-cyan-400/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/10 px-4 py-2">
              <Calendar className="h-4 w-4 text-lime-300" />
              <span className="text-sm font-medium text-lime-300">Events Intelligence</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Live event pipeline for the <span className="text-lime-400">main site</span>
            </h2>
            <p className="max-w-2xl text-lg text-slate-300">
              The landing page now pulls from the same event dataset used inside the athlete dashboard, so visitors see real upcoming competitions instead of static placeholders.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-sm text-slate-400">Upcoming</p>
              <p className="mt-2 text-2xl font-semibold text-white">{upcomingEvents.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-sm text-slate-400">Live Now</p>
              <p className="mt-2 text-2xl font-semibold text-white">{liveCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm col-span-2 sm:col-span-1">
              <p className="text-sm text-slate-400">Sports Covered</p>
              <p className="mt-2 text-2xl font-semibold text-white">{new Set(upcomingEvents.map((event) => event.sport)).size}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <div className="mr-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">Filter by level</span>
          </div>
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilter === filter.id
                  ? 'bg-lime-400 text-[#0f172a]'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event.submissionDeadline, event.date, event.tournamentEndDate);
            const participationType = getParticipationType(event.sport);

            return (
              <article
                key={event.id}
                className="group rounded-3xl border border-white/10 bg-[#111b31]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-lime-400/30"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-lime-300">
                      {event.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <Badge className={getStatusClasses(status)}>{status}</Badge>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-lime-400/30 text-lime-300">
                    {event.level}
                  </Badge>
                  <Badge variant="outline" className="border-white/15 text-slate-300">
                    {participationType}
                  </Badge>
                  <Badge variant="outline" className="border-white/15 text-slate-300">
                    {event.gender}
                  </Badge>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200">{event.sport}</span>
                  {event.submissionDeadline && (
                    <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                      Apply by {formatDateRange(event.submissionDeadline)}
                    </span>
                  )}
                </div>

                <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-300">
                  {event.description ?? `${event.sport} competition for ${event.gender.toLowerCase()} athletes at ${event.level.toLowerCase()} level.`}
                </p>

                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-slate-500" />
                      <span>{formatDateRange(event.date, event.tournamentEndDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onSignInClick}
                    className="text-lime-300 hover:bg-lime-400/10 hover:text-lime-200"
                  >
                    View Details
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/20">
                <Trophy className="h-5 w-5 text-sky-300" />
              </div>
              <h4 className="text-lg font-semibold text-white">Team Sports in Rotation</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {featuredSports.team.length > 0 ? (
                featuredSports.team.map((sport) => (
                  <span key={sport} className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200">
                    {sport}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">No team-sport events in the selected filter right now.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/20">
                <Users className="h-5 w-5 text-orange-300" />
              </div>
              <h4 className="text-lg font-semibold text-white">Solo Sports in Rotation</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {featuredSports.solo.length > 0 ? (
                featuredSports.solo.map((sport) => (
                  <span key={sport} className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200">
                    {sport}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">No solo-sport events in the selected filter right now.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            onClick={onSignInClick}
            className="bg-lime-400 px-8 font-semibold text-[#0f172a] hover:bg-lime-500"
          >
            Explore Event Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsIntelligence;
