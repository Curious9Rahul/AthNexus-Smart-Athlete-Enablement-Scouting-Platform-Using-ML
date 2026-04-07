import type { Athlete } from '@/hooks/useAthletes';
import type { Event } from '@/pages/dashboard/events/types';
import { getUrgency } from './types';

interface EmailTemplateProps {
    athlete: Athlete;
    event: Event;
    otherEvents?: Event[];
}

const BRAND_NAVY = '#0f172a';
const BRAND_NAVY_LIGHT = '#1e293b';
const BRAND_LIME = '#a3e635';
const BRAND_LIME_DARK = '#84cc16';
const GRAY_TEXT = '#94a3b8';
const WHITE = '#ffffff';

const urgencyConfig = {
    CRITICAL: { color: '#ef4444', bg: '#2d1111', label: '🔴 CRITICAL — DEADLINE IN UNDER 24 HOURS' },
    URGENT: { color: '#f97316', bg: '#2d1a0e', label: '🟠 URGENT — DEADLINE IN 48 HOURS' },
    'CLOSING SOON': { color: '#eab308', bg: '#2a2209', label: '🟡 CLOSING SOON — 72 HOURS LEFT' },
    OPEN: { color: '#22c55e', bg: '#0c2a1a', label: '🟢 OPEN — REGISTRATION AVAILABLE' },
};

export default function EmailTemplate({ athlete, event, otherEvents = [] }: EmailTemplateProps) {
    const urgency = getUrgency(event.submissionDeadline);
    const urg = urgencyConfig[urgency];

    const formatDate = (iso: string | undefined) => {
        if (!iso) return 'TBD';
        return new Date(iso).toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });
    };

    const firstName = athlete.name.split(' ')[0];

    const otherMatches = otherEvents
        .filter(e => e.sport.toLowerCase() === athlete.sport.toLowerCase() && e.id !== event.id)
        .slice(0, 3);

    return (
        <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', backgroundColor: '#f1f5f9', padding: '24px 0', minWidth: 320 }}>
            <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 600, margin: '0 auto' }}>
                <tbody>
                    {/* Header */}
                    <tr>
                        <td style={{ backgroundColor: BRAND_NAVY, borderRadius: '12px 12px 0 0', padding: '28px 32px' }}>
                            <table width="100%" cellPadding={0} cellSpacing={0}>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: 8,
                                                    backgroundColor: BRAND_LIME,
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 18, fontWeight: 900, color: BRAND_NAVY,
                                                    verticalAlign: 'middle',
                                                }}>S</div>
                                                <span style={{ fontSize: 20, fontWeight: 700, color: WHITE, verticalAlign: 'middle', marginLeft: 10 }}>
                                                    Ath<span style={{ color: BRAND_LIME }}>Nexus</span>
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: 11, color: GRAY_TEXT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                                Tournament Alert
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>

                    {/* Urgency Banner */}
                    <tr>
                        <td style={{ backgroundColor: urg.bg, padding: '12px 32px', borderLeft: `4px solid ${urg.color}` }}>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: urg.color, letterSpacing: '0.05em' }}>
                                {urg.label}
                            </p>
                        </td>
                    </tr>

                    {/* Greeting */}
                    <tr>
                        <td style={{ backgroundColor: BRAND_NAVY_LIGHT, padding: '32px 32px 0' }}>
                            <p style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: WHITE }}>
                                Hey {firstName}! 🏆
                            </p>
                            <p style={{ margin: '0 0 24px', fontSize: 14, color: GRAY_TEXT, lineHeight: 1.6 }}>
                                You've been matched to a tournament based on your <strong style={{ color: BRAND_LIME }}>{athlete.sport}</strong> profile.
                                Don't miss your window to register!
                            </p>
                        </td>
                    </tr>

                    {/* Tournament Card */}
                    <tr>
                        <td style={{ backgroundColor: BRAND_NAVY_LIGHT, padding: '0 32px 24px' }}>
                            <div style={{
                                backgroundColor: BRAND_NAVY,
                                borderRadius: 10,
                                border: `1px solid rgba(163,230,53,0.25)`,
                                overflow: 'hidden',
                            }}>
                                {/* Card Header */}
                                <div style={{ backgroundColor: BRAND_LIME, padding: '16px 20px' }}>
                                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: BRAND_NAVY, lineHeight: 1.3 }}>
                                        {event.name}
                                    </p>
                                    <p style={{ margin: '4px 0 0', fontSize: 12, color: BRAND_NAVY, opacity: 0.7 }}>
                                        {event.level} Level • {event.sport}
                                    </p>
                                </div>
                                {/* Card Details */}
                                <div style={{ padding: '20px' }}>
                                    <table width="100%" cellPadding={0} cellSpacing={0}>
                                        <tbody>
                                            {[
                                                ['📅 Date', formatDate(event.date)],
                                                ['⏰ Time', event.time],
                                                ['📍 Venue', event.location],
                                                ['🏅 Level', event.level],
                                                ['⚥ Category', event.gender],
                                                ['📋 Registration Deadline', formatDate(event.submissionDeadline)],
                                            ].map(([label, value]) => (
                                                <tr key={label} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '8px 0', fontSize: 12, color: GRAY_TEXT, width: '45%', verticalAlign: 'top' }}>
                                                        {label}
                                                    </td>
                                                    <td style={{ padding: '8px 0', fontSize: 13, color: WHITE, fontWeight: 600, verticalAlign: 'top' }}>
                                                        {value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {event.description && (
                                        <p style={{ margin: '16px 0 0', fontSize: 12, color: GRAY_TEXT, lineHeight: 1.6, fontStyle: 'italic' }}>
                                            {event.description.slice(0, 180)}{event.description.length > 180 ? '…' : ''}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* CTA Buttons */}
                    <tr>
                        <td style={{ backgroundColor: BRAND_NAVY_LIGHT, padding: '0 32px 32px' }}>
                            <table width="100%" cellPadding={0} cellSpacing={0}>
                                <tbody>
                                    <tr>
                                        <td style={{ paddingRight: 8 }}>
                                            <a href={event.brochureUrl || '#'} style={{
                                                display: 'block', textAlign: 'center', padding: '14px 0',
                                                backgroundColor: BRAND_LIME, color: BRAND_NAVY,
                                                fontWeight: 700, fontSize: 14, borderRadius: 8,
                                                textDecoration: 'none', letterSpacing: '0.05em',
                                            }}>
                                                REGISTER NOW →
                                            </a>
                                        </td>
                                        <td style={{ paddingLeft: 8 }}>
                                            <a href="#" style={{
                                                display: 'block', textAlign: 'center', padding: '14px 0',
                                                backgroundColor: 'transparent', color: BRAND_LIME,
                                                fontWeight: 600, fontSize: 13, borderRadius: 8,
                                                textDecoration: 'none', border: `1px solid ${BRAND_LIME}`,
                                            }}>
                                                View Event Details
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>

                    {/* Other Matches */}
                    {otherMatches.length > 0 && (
                        <tr>
                            <td style={{ backgroundColor: BRAND_NAVY_LIGHT, padding: '0 32px 24px' }}>
                                <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: WHITE }}>
                                    Other {athlete.sport} tournaments you may be eligible for:
                                </p>
                                {otherMatches.map(e => (
                                    <div key={e.id} style={{
                                        padding: '12px 16px', marginBottom: 8,
                                        backgroundColor: BRAND_NAVY, borderRadius: 8,
                                        borderLeft: `3px solid ${BRAND_LIME_DARK}`,
                                    }}>
                                        <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: WHITE }}>{e.name}</p>
                                        <p style={{ margin: 0, fontSize: 11, color: GRAY_TEXT }}>{e.level} • {formatDate(e.date)}</p>
                                    </div>
                                ))}
                            </td>
                        </tr>
                    )}

                    {/* Why you're receiving this */}
                    <tr>
                        <td style={{ backgroundColor: BRAND_NAVY_LIGHT, padding: '0 32px 24px' }}>
                            <div style={{
                                backgroundColor: 'rgba(163,230,53,0.07)', border: '1px solid rgba(163,230,53,0.2)',
                                borderRadius: 8, padding: '16px',
                            }}>
                                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: BRAND_LIME }}>
                                    Why am I receiving this?
                                </p>
                                <p style={{ margin: 0, fontSize: 12, color: GRAY_TEXT, lineHeight: 1.6 }}>
                                    Your AthNexus profile shows you play <strong style={{ color: WHITE }}>{athlete.sport}</strong> at
                                    <strong style={{ color: WHITE }}> {athlete.competitionLevel}</strong> level with
                                    <strong style={{ color: WHITE }}> {athlete.experienceYears} years</strong> of experience.
                                    This tournament matches your sport and competition level.
                                </p>
                            </div>
                        </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                        <td style={{
                            backgroundColor: BRAND_NAVY, borderRadius: '0 0 12px 12px',
                            padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: WHITE, textAlign: 'center' }}>
                                Ath<span style={{ color: BRAND_LIME }}>Nexus</span>
                            </p>
                            <p style={{ margin: '0 0 12px', fontSize: 12, color: GRAY_TEXT, textAlign: 'center', lineHeight: 1.6 }}>
                                Smart Athlete Enablement &amp; Scouting Platform<br />
                                Empowering student athletes to reach their full potential
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: '#475569', textAlign: 'center' }}>
                                This is an automated tournament alert. To stop receiving these emails,{' '}
                                <a href="#" style={{ color: GRAY_TEXT }}>unsubscribe here</a>.
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

