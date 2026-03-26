import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface EventRegistration {
  athleteId: string | number;
  athleteName: string;
  athleteEmail: string;
  registeredAt: string;
  reg_status: "PENDING" | "APPROVED" | "REJECTED";
  reject_reason?: string;
}

export interface AppEvent {
  id: string;
  title: string;
  sport: string;
  level: string;
  type: string;
  format: 'Solo' | 'Duo' | 'Team';
  gender: string;
  venue: string;
  city: string;
  state: string;
  description: string;
  start_date: string;
  end_date: string;
  deadline: string;
  approval_status: "PENDING" | "APPROVED" | "REJECTED";
  status: "LIVE" | "UPCOMING" | "COMPLETED";
  max_participants: number;
  registered_count: number;
  prize: string;
  image_emoji: string;
  created_by: string;
  created_by_role: "admin" | "athlete";
  created_at: string;
  registrations?: EventRegistration[] | string[];
}

const API_BASE_URL = 'http://localhost:5000/api';

export function useEvents() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Derived
  const liveEvents = events.filter(e => e.approval_status === 'APPROVED' && e.status === 'LIVE');
  const upcomingEvents = events.filter(e => e.approval_status === 'APPROVED' && e.status === 'UPCOMING');
  
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + (72 * 60 * 60 * 1000));
  const deadlineEvents = events.filter(e => {
      const deadline = new Date(e.deadline);
      return e.approval_status === 'APPROVED' && deadline > now && deadline <= threeDaysFromNow;
  });
  
  const pendingEvents = events.filter(e => e.approval_status === 'PENDING');

  // Actions
  async function registerForEvent(eventId: string, athleteData: { athleteId: string | number, athleteName: string, athleteEmail: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(athleteData)
      });
      if (!response.ok) throw new Error('Registration failed');
      await fetchEvents();
      toast.success('🎉 Registered! Awaiting verifier approval.');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to register');
      return false;
    }
  }

  async function cancelRegistration(eventId: string, athleteId: string | number) {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athleteId })
      });
      if (!response.ok) throw new Error('Failed to cancel registration');
      await fetchEvents();
      toast.success('Registration cancelled');
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  }

  async function createEvent(formData: any, createdBy: string | number, role: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/events/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, created_by: createdBy, created_by_role: role })
      });
      if (!response.ok) throw new Error('Failed to create event');
      await fetchEvents();
      if (role === 'athlete') {
          toast.success('🎉 Event submitted for review!');
      } else {
          toast.success('✅ Event created successfully!');
      }
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  }

  async function approveEvent(eventId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/verifier/events/${eventId}/approve`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to approve event');
      await fetchEvents();
      toast.success('✅ Event approved and now live!');
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  }

  async function rejectEvent(eventId: string, reason: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/verifier/events/${eventId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to reject event');
      await fetchEvents();
      toast.success('Event rejected.');
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  }

  async function approveRegistration(eventId: string, athleteId: string | number) {
    try {
      const response = await fetch(`${API_BASE_URL}/verifier/registrations/${eventId}/${athleteId}/approve`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to approve registration');
      await fetchEvents();
      toast.success('✅ Registration approved. Email sent.');
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  }

  async function rejectRegistration(eventId: string, athleteId: string | number, reason: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/verifier/registrations/${eventId}/${athleteId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to reject registration');
      await fetchEvents();
      toast.success('Registration rejected. Email sent.');
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  }

  // Filter helpers
  function filterByLevel(level: string) {
    return events.filter(e => e.level === level);
  }

  function filterByType(type: string) {
    return events.filter(e => e.type === type);
  }

  function filterByFormat(format: string) {
    return events.filter(e => e.format === format);
  }

  function searchEvents(query: string) {
    const q = query.toLowerCase();
    return events.filter(e => 
      e.title.toLowerCase().includes(q) || 
      e.sport.toLowerCase().includes(q) || 
      e.venue.toLowerCase().includes(q) || 
      e.city.toLowerCase().includes(q)
    );
  }

  return {
    events,
    loading,
    error,
    liveEvents,
    upcomingEvents,
    deadlineEvents,
    pendingEvents,
    refreshEvents: fetchEvents,
    registerForEvent,
    cancelRegistration,
    createEvent,
    approveEvent,
    rejectEvent,
    approveRegistration,
    rejectRegistration,
    filterByLevel,
    filterByType,
    filterByFormat,
    searchEvents
  };
}
