import type { Athlete } from '@/hooks/useAthletes';
import type { Event } from '@/pages/dashboard/events/types';

export type { Athlete, Event };

// A unique key for tracking notifications: `athleteId-eventId`
export type NotificationKey = `${number}-${number}`;

export interface EmailPreviewState {
    athlete: Athlete;
    event: Event;
}

/** Urgency level based on hours until submission deadline */
export type UrgencyLevel = 'CRITICAL' | 'URGENT' | 'CLOSING SOON' | 'OPEN';

export function getUrgency(submissionDeadline: string | undefined): UrgencyLevel {
    if (!submissionDeadline) return 'OPEN';
    const hoursLeft = (new Date(submissionDeadline).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursLeft <= 0) return 'CRITICAL';
    if (hoursLeft <= 24) return 'CRITICAL';
    if (hoursLeft <= 48) return 'URGENT';
    if (hoursLeft <= 72) return 'CLOSING SOON';
    return 'OPEN';
}

export const URGENCY_STYLES: Record<UrgencyLevel, { label: string; bg: string; text: string; dot: string }> = {
    'CRITICAL': {
        label: '🔴 CRITICAL',
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        dot: '#ef4444',
    },
    'URGENT': {
        label: '🟠 URGENT',
        bg: 'bg-orange-500/20',
        text: 'text-orange-400',
        dot: '#f97316',
    },
    'CLOSING SOON': {
        label: '🟡 CLOSING SOON',
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        dot: '#eab308',
    },
    'OPEN': {
        label: '🟢 OPEN',
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        dot: '#22c55e',
    },
};
