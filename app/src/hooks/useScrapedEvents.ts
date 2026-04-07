import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface ScrapedEvent {
  _id: string;
  source_name: string;
  source_page: string;
  external_id: string | null;
  event_url: string | null;
  title: string;
  institute_department: string;
  event_type: string;
  audience_type: string;
  start_date: string;
  end_date: string;
  location: string;
  summary: string;
  image_url: string;
  scraped_at: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScrapedEventsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ScrapedEventsFilters {
  keyword?: string;
  event_type?: string;
  audience_type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: 'asc' | 'desc';
}

export interface ScraperStats {
  overview: {
    total_events: number;
    active_events: number;
    archived_events: number;
  };
  latest_run: {
    status: string;
    started_at: string;
    finished_at: string;
    runtime_ms: number;
    fetched: number;
    inserted: number;
    updated: number;
    unchanged: number;
    failed: number;
    skipped: number;
  } | null;
  recent_runs: Array<{
    _id: string;
    status: string;
    started_at: string;
    runtime_ms: number;
    fetched: number;
    inserted: number;
    updated: number;
    failed: number;
  }>;
  event_type_breakdown: Array<{ _id: string; count: number }>;
}

const API_BASE_URL = 'http://localhost:5000/api';

export function useScrapedEvents(initialFilters?: ScrapedEventsFilters) {
  const [events, setEvents] = useState<ScrapedEvent[]>([]);
  const [pagination, setPagination] = useState<ScrapedEventsPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ScrapedEventsFilters>(initialFilters || {});

  const fetchEvents = useCallback(async (overrideFilters?: ScrapedEventsFilters) => {
    try {
      setLoading(true);
      setError(null);

      const activeFilters = overrideFilters || filters;
      const params = new URLSearchParams();

      if (activeFilters.keyword) params.set('keyword', activeFilters.keyword);
      if (activeFilters.event_type) params.set('event_type', activeFilters.event_type);
      if (activeFilters.audience_type) params.set('audience_type', activeFilters.audience_type);
      if (activeFilters.date_from) params.set('date_from', activeFilters.date_from);
      if (activeFilters.date_to) params.set('date_to', activeFilters.date_to);
      if (activeFilters.page) params.set('page', String(activeFilters.page));
      if (activeFilters.limit) params.set('limit', String(activeFilters.limit));
      if (activeFilters.sort_by) params.set('sort_by', activeFilters.sort_by);
      if (activeFilters.order) params.set('order', activeFilters.order);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/scraped-events${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch scraped events');

      const data = await response.json();
      setEvents(data.data || []);
      setPagination(data.pagination || null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch Somaiya events');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const updateFilters = useCallback((newFilters: Partial<ScrapedEventsFilters>) => {
    setFilters((prev: ScrapedEventsFilters) => ({ ...prev, ...newFilters, page: newFilters.page || 1 }));
  }, []);

  const nextPage = useCallback(() => {
    if (pagination?.hasNext) {
      setFilters((prev: ScrapedEventsFilters) => ({ ...prev, page: (prev.page || 1) + 1 }));
    }
  }, [pagination]);

  const prevPage = useCallback(() => {
    if (pagination?.hasPrev) {
      setFilters((prev: ScrapedEventsFilters) => ({ ...prev, page: Math.max(1, (prev.page || 2) - 1) }));
    }
  }, [pagination]);

  return {
    events,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    nextPage,
    prevPage,
    refreshEvents: fetchEvents,
  };
}

export function useScraperStats() {
  const [stats, setStats] = useState<ScraperStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/scraped-events/stats`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
