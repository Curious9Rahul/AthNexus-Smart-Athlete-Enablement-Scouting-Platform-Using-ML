import { useState } from 'react';
import { useScrapedEvents, useScraperStats } from '@/hooks/useScrapedEvents';
import type { ScrapedEvent } from '@/hooks/useScrapedEvents';
import { Search, Globe, CalendarDays, MapPin, Users, ChevronLeft, ChevronRight, Activity, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';

// ── Somaiya Event Card ────────────────────────────────────────

function SomaiyaEventCard({ event }: { event: ScrapedEvent }) {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : startDate;
  const now = new Date();

  const isLive = now >= startDate && now <= endDate;
  const isUpcoming = now < startDate;
  const isPast = now > endDate;

  const month = startDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = startDate.getDate();

  const statusConfig = isLive
    ? { label: 'LIVE', color: 'bg-red-500/10 text-red-400 border-red-500/30', dot: 'bg-red-500' }
    : isUpcoming
      ? { label: 'UPCOMING', color: 'bg-lime-400/10 text-lime-400 border-lime-400/30', dot: 'bg-lime-400' }
      : { label: 'COMPLETED', color: 'bg-gray-500/10 text-gray-400 border-gray-500/30', dot: 'bg-gray-500' };

  return (
    <div className={`group bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden hover:border-lime-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-lime-400/5 flex flex-col h-full ${isPast ? 'opacity-60' : ''}`}>
      {/* Image Banner */}
      {event.image_url ? (
        <div className="relative h-40 overflow-hidden bg-white/5">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent" />

          {/* Status badge */}
          <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${statusConfig.color}`}>
            {isLive && (
              <span className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig.dot} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${statusConfig.dot}`} />
              </span>
            )}
            {statusConfig.label}
          </div>

          {/* Date chip */}
          <div className="absolute bottom-3 left-3 bg-[#0f172a]/90 backdrop-blur-md rounded-xl overflow-hidden border border-white/10">
            <div className="bg-lime-400 px-3 py-0.5 text-[9px] font-black text-[#0f172a] tracking-wider text-center">
              {month}
            </div>
            <div className="px-3 py-1 text-xl font-black text-white text-center">
              {day}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-28 bg-gradient-to-br from-lime-400/5 to-blue-500/5 flex items-center justify-center">
          <Globe className="w-10 h-10 text-white/10" />
          <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${statusConfig.color}`}>
            {statusConfig.label}
          </div>
          <div className="absolute bottom-3 left-3 bg-[#0f172a]/90 backdrop-blur-md rounded-xl overflow-hidden border border-white/10">
            <div className="bg-lime-400 px-3 py-0.5 text-[9px] font-black text-[#0f172a] tracking-wider text-center">
              {month}
            </div>
            <div className="px-3 py-1 text-xl font-black text-white text-center">
              {day}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-white leading-tight mb-3 line-clamp-2 group-hover:text-lime-400 transition-colors">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <CalendarDays className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {endDate && endDate.getTime() !== startDate.getTime() &&
                ` – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              }
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4 text-lime-400 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {event.audience_type && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="truncate">{event.audience_type}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {event.event_type && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {event.event_type}
            </span>
          )}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/10">
            {event.source_name}
          </span>
        </div>

        {/* Action */}
        {event.event_url && (
          <a
            href={event.event_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-lime-400/10 text-gray-300 hover:text-lime-400 font-semibold rounded-xl transition-all border border-white/10 hover:border-lime-400/30 text-sm"
          >
            View on Somaiya
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Scraper Stats Panel ───────────────────────────────────────

function ScraperStatsBar() {
  const { stats, loading } = useScraperStats();

  if (loading || !stats) return null;

  const latestRun = stats.latest_run;

  return (
    <div className="bg-[#1e293b]/80 border border-white/10 rounded-2xl p-4 mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-lime-400" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Scraper Health</span>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-gray-500">Total Events</span>
            <span className="ml-2 font-mono font-bold text-white">{stats.overview.active_events}</span>
          </div>

          {latestRun && (
            <>
              <div>
                <span className="text-gray-500">Last Run</span>
                <span className={`ml-2 font-mono font-bold ${latestRun.status === 'SUCCESS' ? 'text-lime-400' : latestRun.status === 'FAILED' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {latestRun.status}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Updated</span>
                <span className="ml-2 font-mono font-bold text-white">
                  {new Date(latestRun.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Inserted</span>
                <span className="ml-1 font-mono font-bold text-lime-400">{latestRun.inserted}</span>
                <span className="text-gray-600 mx-1">·</span>
                <span className="text-gray-500">Updated</span>
                <span className="ml-1 font-mono font-bold text-blue-400">{latestRun.updated}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

const SomaiyaEventsPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');

  const {
    events,
    pagination,
    loading,
    filters,
    updateFilters,
    nextPage,
    prevPage,
  } = useScrapedEvents({ limit: 12, sort_by: 'start_date', order: 'desc' });

  // Debounced search
  const handleSearch = (value: string) => {
    setSearchInput(value);
    // Simple debounce
    const timer = setTimeout(() => {
      updateFilters({ keyword: value || undefined });
    }, 400);
    return () => clearTimeout(timer);
  };

  const EVENT_TYPES = ['', 'Sports', 'Cultural', 'Academic', 'Workshop'];
  const AUDIENCE_TYPES = ['', 'Students', 'Staff', 'Alumni', 'All'];

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-lime-400 mb-2">
          <Globe className="w-5 h-5" />
          <span className="text-sm font-black tracking-[0.2em] uppercase">Somaiya Events</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">
          Somaiya Sports Academy Events
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Auto-synced events from the Somaiya Sports Academy. Updated daily via our scraping pipeline.
        </p>
      </div>

      {/* Scraper Health Bar */}
      <ScraperStatsBar />

      {/* Filters */}
      <div className="bg-[#1e293b] border border-white/10 p-6 rounded-2xl mb-10 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Search</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                className="pl-11 h-12 bg-black/20 border-white/10 text-white rounded-xl focus:border-lime-400/50 transition-all"
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Event Type */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Event Type</label>
            <select
              className="w-full h-12 bg-black/20 border border-white/10 text-white rounded-xl px-4 outline-none focus:border-lime-400/50 transition-all appearance-none cursor-pointer"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                updateFilters({ event_type: e.target.value || undefined });
              }}
            >
              <option value="" className="bg-[#1e293b]">All Types</option>
              {EVENT_TYPES.filter(t => t).map(t => (
                <option key={t} value={t} className="bg-[#1e293b]">{t}</option>
              ))}
            </select>
          </div>

          {/* Audience */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Audience</label>
            <select
              className="w-full h-12 bg-black/20 border border-white/10 text-white rounded-xl px-4 outline-none focus:border-lime-400/50 transition-all appearance-none cursor-pointer"
              value={selectedAudience}
              onChange={(e) => {
                setSelectedAudience(e.target.value);
                updateFilters({ audience_type: e.target.value || undefined });
              }}
            >
              <option value="" className="bg-[#1e293b]">All Audiences</option>
              {AUDIENCE_TYPES.filter(t => t).map(t => (
                <option key={t} value={t} className="bg-[#1e293b]">{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[380px] bg-white/5 rounded-2xl border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
          <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            No Somaiya events match your current filters. Try adjusting your search.
          </p>
          <button
            onClick={() => {
              setSearchInput('');
              setSelectedType('');
              setSelectedAudience('');
              updateFilters({ keyword: undefined, event_type: undefined, audience_type: undefined });
            }}
            className="mt-6 text-lime-400 font-semibold hover:text-lime-300 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          {/* Event Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map(event => (
              <SomaiyaEventCard key={event._id} event={event} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={prevPage}
                disabled={!pagination.hasPrev}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-sm text-gray-400 font-mono">
                Page <span className="text-white font-bold">{pagination.page}</span> of{' '}
                <span className="text-white font-bold">{pagination.totalPages}</span>
                <span className="text-gray-600 ml-2">({pagination.total} events)</span>
              </span>

              <button
                onClick={nextPage}
                disabled={!pagination.hasNext}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold text-sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SomaiyaEventsPage;
