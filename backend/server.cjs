const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();

const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const mlRoutes = require('./routes/ml');
const User = require('./models/User');

const app = express();
const port = process.env.PORT || 5000;
const resend = new Resend(process.env.RESEND_API_KEY || 're_1234567890');
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/athnexus')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Auth Routes
app.use('/api/auth', authRoutes);

// ML Routes
app.use('/api/ml', mlRoutes);

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mock database for events
const eventsFilePath = path.join(__dirname, 'data', 'events.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Helper to get events — BOM-safe, crash-safe
const getEvents = () => {
  try {
    if (fs.existsSync(eventsFilePath)) {
      const raw = fs.readFileSync(eventsFilePath, 'utf8').replace(/^\uFEFF/, '');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[DATA] events.json read/parse error — resetting to []:', err.message);
    // Auto-repair: overwrite with empty array so server stays up
    try { fs.writeFileSync(eventsFilePath, '[]', 'utf8'); } catch (_) {}
  }
  return [];
};

// Helper to build tournament email HTML
function buildTournamentEmailHTML(playerName, tournament) {
  const urgencyBanner = tournament.hoursLeft <= 24
    ? `<div style="background: #450a0a; border-left: 4px solid #ef4444; padding: 16px; margin: 0 32px 24px; color: #fca5a5; font-size: 14px;">🚨 <strong>CRITICAL</strong> — Only ${tournament.hoursLeft} hours left to register! Act now.</div>`
    : tournament.hoursLeft <= 48
      ? `<div style="background: #431407; border-left: 4px solid #f97316; padding: 16px; margin: 0 32px 24px; color: #fdba74; font-size: 14px;">⚡ <strong>URGENT</strong> — ${tournament.hoursLeft} hours remaining. Registration closing very soon.</div>`
      : tournament.hoursLeft <= 72
        ? `<div style="background: #422006; border-left: 4px solid #f59e0b; padding: 16px; margin: 0 32px 24px; color: #fcd34d; font-size: 14px;">⏰ <strong>Closing Soon</strong> — ${tournament.hoursLeft} hours left to secure your spot.</div>`
        : '';

  const slotsUrgency = tournament.slotsLeft <= 10
    ? `<span style="color: #ef4444; font-weight: 700;">${tournament.slotsLeft} of ${tournament.totalSlots} — Hurry!</span>`
    : `${tournament.slotsLeft} of ${tournament.totalSlots}`;

  return `
    <div style="background: #0a0f1a; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #f1f5f9; padding: 20px; border-radius: 16px;">
        <div style="background: #0f172a; padding: 28px 32px; border-bottom: 3px solid #84cc16; border-radius: 12px 12px 0 0;">
            <div style="font-size: 28px; font-weight: 800; color: #84cc16; letter-spacing: 2px;">AthNexus</div>
        </div>
        <div style="background: #0f172a; padding: 24px 32px;">
            <div style="font-size: 20px; font-weight: 700;">Hey ${playerName}! 👋</div>
            <p style="color: #94a3b8; font-size: 14px;">A tournament matches your athlete profile. We thought you'd want to know!</p>
        </div>
        ${urgencyBanner}
        <div style="background: #1e293b; padding: 24px; border-radius: 12px; border: 1px solid #334155; border-top: 4px solid #84cc16; margin: 0 32px;">
            <div style="font-size: 20px; font-weight: 800; margin-bottom: 15px; color: #ffffff;">${tournament.tournamentName}</div>
            <div style="font-size: 13px; color: #e2e8f0; line-height: 1.6;">
                <p style="margin: 5px 0;">📅 <strong>Date:</strong> ${tournament.date} | ⏰ <strong>Time:</strong> ${tournament.time}</p>
                <p style="margin: 5px 0;">📍 <strong>Venue:</strong> ${tournament.venue}</p>
                <p style="margin: 5px 0;">🏆 <strong>Level:</strong> ${tournament.type} | 🎯 <strong>Sport:</strong> ${tournament.sport}</p>
                <p style="margin: 5px 0;">💰 <strong>Prize Pool:</strong> ${tournament.prizePool} | 🎫 <strong>Slots:</strong> ${slotsUrgency}</p>
            </div>
        </div>
        <div style="text-align: center; padding: 30px;">
            <a href="https://athnexus.com/register/${tournament.id || 'direct'}" style="background: #84cc16; color: #0f172a; padding: 14px 32px; border-radius: 8px; font-weight: 800; display: inline-block; text-decoration: none; font-size: 16px; box-shadow: 0 4px 12px rgba(132, 204, 22, 0.2);">REGISTER NOW →</a>
        </div>
        <div style="background: #1e293b; padding: 15px; border-radius: 8px; font-size: 12px; color: #94a3b8; text-align: center; margin: 0 32px 32px;">
            This alert was sent based on your athlete profile. Keep your profile updated for better matches!
        </div>
    </div>
  `;
}

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Status logic helper
function computeStatus(event) {
  const now = new Date();
  const start = new Date(event.start_date);
  const end = new Date(event.end_date);
  if (now >= start && now <= end) return "LIVE";
  if (now < start) return "UPCOMING";
  return "COMPLETED";
}

// Helper to save events — atomic write to prevent corruption
const saveEvents = (events) => {
  const tmp = eventsFilePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(events, null, 2), 'utf8');
  fs.renameSync(tmp, eventsFilePath);
};

// ── Users helpers ──────────────────────────────────────────────
const usersFilePath = path.join(__dirname, 'data', 'users.json');
const getUsers = () => {
  try {
    if (fs.existsSync(usersFilePath)) {
      const raw = fs.readFileSync(usersFilePath, 'utf8').replace(/^\uFEFF/, '');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[DATA] users.json read/parse error — resetting to []:', err.message);
    try { fs.writeFileSync(usersFilePath, '[]', 'utf8'); } catch (_) {}
  }
  return [];
};
const saveUsers = (users) => {
  const tmp = usersFilePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(users, null, 2), 'utf8');
  fs.renameSync(tmp, usersFilePath);
};

// ── Luma-style email builders ──────────────────────────────────

function buildRegistrationApprovedEmail(athleteName, event) {
  const startDate = new Date(event.start_date);
  const month = startDate.toLocaleString('en-IN', { month: 'short' }).toUpperCase();
  const day = startDate.getDate();
  const dateStr = startDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeStr = startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0d1520;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;margin:0 auto;background:#0d1520;">
  <tr><td style="padding:20px 24px;border-bottom:1px solid #1e2e40;">
    <span style="font-size:16px;font-weight:700;color:#a8e63d;">AthNexus</span>
  </td></tr>
  <tr><td style="padding:28px 24px 16px;background:#111a28;">
    <div style="display:inline-block;background:#a8e63d;color:#0d1520;font-size:11px;font-weight:800;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px;">✅ Registration Confirmed</div>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#fff;line-height:1.2;">${event.image_emoji || '🏆'} ${event.title}</h1>
    <p style="margin:0;font-size:15px;color:#8aaabf;">You&rsquo;re officially registered. See you there!</p>
  </td></tr>
  <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #1e2e40;margin:0;"></td></tr>
  <tr><td style="padding:20px 24px 12px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:top;padding-right:14px;">
        <div style="background:#1e2e40;border-radius:8px;width:48px;text-align:center;overflow:hidden;">
          <div style="background:#a8e63d;padding:3px 0;font-size:10px;font-weight:700;color:#0d1520;text-transform:uppercase;">${month}</div>
          <div style="padding:6px 0;font-size:22px;font-weight:800;color:#fff;">${day}</div>
        </div>
      </td>
      <td style="vertical-align:middle;">
        <p style="margin:0;font-size:15px;font-weight:700;color:#fff;">${dateStr}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#5a8aaa;">${timeStr} IST</p>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:4px 24px 16px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:top;padding-right:14px;">
        <div style="background:#1e2e40;border-radius:8px;width:48px;height:48px;text-align:center;line-height:48px;font-size:20px;">📍</div>
      </td>
      <td style="vertical-align:middle;">
        <p style="margin:0;font-size:15px;font-weight:700;color:#fff;">${event.venue}</p>
        <p style="margin:3px 0 0;font-size:13px;color:#5a8aaa;">${event.city}, ${event.state}</p>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #1e2e40;margin:0;"></td></tr>
  <tr><td style="padding:16px 24px 8px;">
    <p style="margin:0;font-size:13px;color:#5a8aaa;">Prize: <span style="color:#ffd044;font-weight:600;">${event.prize}</span></p>
  </td></tr>
  <tr><td style="padding:12px 24px 28px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="padding-right:10px;"><a href="${appUrl}/dashboard/events/${event.id}" style="display:inline-block;background:#a8e63d;color:#0d1520;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:700;">View Event</a></td>
      <td><a href="${appUrl}/dashboard/my-events" style="display:inline-block;background:#1e2e40;color:#c0d4e8;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;border:1px solid #2a3e52;">My Events</a></td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:16px 24px;border-top:1px solid #1e2e40;text-align:center;">
    <p style="margin:0;font-size:12px;color:#5a8aaa;">Best of luck, ${athleteName}! — AthNexus Verifier Team</p>
  </td></tr>
</table></body></html>`;
}

function buildRegistrationRejectedEmail(athleteName, event, reason) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0d1520;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;margin:0 auto;background:#0d1520;">
  <tr><td style="padding:20px 24px;border-bottom:1px solid #1e2e40;">
    <span style="font-size:16px;font-weight:700;color:#a8e63d;">AthNexus</span>
  </td></tr>
  <tr><td style="padding:28px 24px 16px;background:#111a28;">
    <div style="display:inline-block;background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3);font-size:11px;font-weight:800;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px;">❌ Registration Not Approved</div>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#fff;line-height:1.2;">${event.image_emoji || '🏆'} ${event.title}</h1>
    <p style="margin:0;font-size:15px;color:#8aaabf;">Unfortunately your registration was not approved this time.</p>
  </td></tr>
  <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #1e2e40;margin:0;"></td></tr>
  ${reason ? `<tr><td style="padding:20px 24px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#5a8aaa;text-transform:uppercase;letter-spacing:.06em;">Reason</p>
    <p style="margin:0;font-size:14px;color:#e0eaf5;background:#1e2e40;padding:12px 16px;border-radius:8px;border-left:3px solid #f87171;">${reason}</p>
  </td></tr>` : ''}
  <tr><td style="padding:12px 24px 28px;">
    <a href="${appUrl}/dashboard/events" style="display:inline-block;background:#a8e63d;color:#0d1520;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:700;">Explore Other Events</a>
  </td></tr>
  <tr><td style="padding:16px 24px;border-top:1px solid #1e2e40;text-align:center;">
    <p style="margin:0;font-size:12px;color:#5a8aaa;">Keep training, ${athleteName}! — AthNexus Verifier Team</p>
  </td></tr>
</table></body></html>`;
}

function buildEventApprovedEmail(creatorName, event) {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0d1520;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;margin:0 auto;background:#0d1520;">
  <tr><td style="padding:20px 24px;border-bottom:1px solid #1e2e40;">
    <span style="font-size:16px;font-weight:700;color:#a8e63d;">AthNexus</span>
  </td></tr>
  <tr><td style="padding:28px 24px 16px;background:#111a28;">
    <div style="display:inline-block;background:#a8e63d;color:#0d1520;font-size:11px;font-weight:800;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px;">🎉 Event Approved!</div>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#fff;line-height:1.2;">${event.image_emoji || '🏆'} ${event.title}</h1>
    <p style="margin:0;font-size:15px;color:#8aaabf;">is now live on AthNexus. Athletes can discover and register for it now.</p>
  </td></tr>
  <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #1e2e40;margin:0;"></td></tr>
  <tr><td style="padding:20px 24px 8px;">
    <p style="margin:4px 0;font-size:13px;color:#8aaabf;">📅 ${startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} – ${endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
    <p style="margin:4px 0;font-size:13px;color:#8aaabf;">📍 ${event.venue}, ${event.city}</p>
    <p style="margin:4px 0;font-size:13px;color:#8aaabf;">👥 Max ${event.max_participants} participants</p>
  </td></tr>
  <tr><td style="padding:12px 24px 28px;">
    <a href="${appUrl}/dashboard/events/${event.id}" style="display:inline-block;background:#a8e63d;color:#0d1520;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:700;">View Your Event</a>
  </td></tr>
  <tr><td style="padding:16px 24px;border-top:1px solid #1e2e40;text-align:center;">
    <p style="margin:0;font-size:12px;color:#5a8aaa;">— AthNexus Verifier Team</p>
  </td></tr>
</table></body></html>`;
}

function buildEventRejectedEmail(creatorName, event, reason) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0d1520;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;margin:0 auto;background:#0d1520;">
  <tr><td style="padding:20px 24px;border-bottom:1px solid #1e2e40;">
    <span style="font-size:16px;font-weight:700;color:#a8e63d;">AthNexus</span>
  </td></tr>
  <tr><td style="padding:28px 24px 16px;background:#111a28;">
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#fff;line-height:1.2;">Your event was not approved</h1>
    <p style="margin:0;font-size:15px;color:#8aaabf;">${event.image_emoji || '🏆'} ${event.title}</p>
  </td></tr>
  <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #1e2e40;margin:0;"></td></tr>
  ${reason ? `<tr><td style="padding:20px 24px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#5a8aaa;text-transform:uppercase;letter-spacing:.06em;">Reason</p>
    <p style="margin:0;font-size:14px;color:#e0eaf5;background:#1e2e40;padding:12px 16px;border-radius:8px;border-left:3px solid #f87171;">${reason}</p>
  </td></tr>` : ''}
  <tr><td style="padding:8px 24px 12px;"><p style="margin:0;font-size:13px;color:#8aaabf;">You can edit and resubmit from My Events page.</p></td></tr>
  <tr><td style="padding:12px 24px 28px;">
    <a href="${appUrl}/dashboard/my-events" style="display:inline-block;background:#a8e63d;color:#0d1520;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:700;">Go to My Events</a>
  </td></tr>
  <tr><td style="padding:16px 24px;border-top:1px solid #1e2e40;text-align:center;">
    <p style="margin:0;font-size:12px;color:#5a8aaa;">— AthNexus Verifier Team</p>
  </td></tr>
</table></body></html>`;
}

function buildDeadlineReminderEmail(recipientName, event, hoursLeft) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';
  const startDate = new Date(event.start_date);
  const month = startDate.toLocaleString('en-IN', { month: 'short' }).toUpperCase();
  const day = startDate.getDate();
  const timeStr = startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const timeLeft = hoursLeft > 24 ? `${Math.floor(hoursLeft/24)} days` : `${Math.floor(hoursLeft)} hours`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0d1520;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;margin:0 auto;background:#0d1520;">
  <tr><td style="padding:20px 24px;border-bottom:1px solid #1e2e40;">
    <span style="font-size:16px;font-weight:700;color:#a8e63d;">AthNexus</span>
  </td></tr>
  <tr><td style="padding:28px 24px 16px;background:#111a28;">
    <div style="display:inline-block;background:rgba(249,115,22,0.15);color:#fb923c;border:1px solid rgba(249,115,22,0.3);font-size:11px;font-weight:800;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px;">⏰ Deadline Approaching!</div>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#fff;line-height:1.2;">${event.image_emoji || '🏆'} ${event.title}</h1>
    <p style="margin:0;font-size:15px;color:#fb923c;font-weight:600;">Registration closes in ${timeLeft}</p>
  </td></tr>
  <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #1e2e40;margin:0;"></td></tr>
  <tr><td style="padding:20px 24px 12px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:top;padding-right:14px;">
        <div style="background:#1e2e40;border-radius:8px;width:48px;text-align:center;overflow:hidden;">
          <div style="background:#a8e63d;padding:3px 0;font-size:10px;font-weight:700;color:#0d1520;text-transform:uppercase;">${month}</div>
          <div style="padding:6px 0;font-size:22px;font-weight:800;color:#fff;">${day}</div>
        </div>
      </td>
      <td style="vertical-align:middle;">
        <p style="margin:0;font-size:13px;color:#8aaabf;">${timeStr} IST</p>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:4px 24px 8px;">
    <p style="margin:4px 0;font-size:13px;color:#8aaabf;">📍 ${event.venue}, ${event.city}</p>
    <p style="margin:4px 0;font-size:13px;color:#8aaabf;">🏆 ${event.prize}</p>
    <p style="margin:4px 0;font-size:13px;color:#8aaabf;">👥 ${event.registered_count || 0}/${event.max_participants} spots taken</p>
  </td></tr>
  <tr><td style="padding:12px 24px 28px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="padding-right:10px;"><a href="${appUrl}/dashboard/events/${event.id}" style="display:inline-block;background:#a8e63d;color:#0d1520;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:700;">Register Now</a></td>
      <td><a href="${appUrl}/dashboard/events" style="display:inline-block;background:#1e2e40;color:#c0d4e8;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;border:1px solid #2a3e52;">View Event</a></td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:16px 24px;border-top:1px solid #1e2e40;text-align:center;">
    <p style="margin:0;font-size:12px;color:#5a8aaa;">Don&rsquo;t miss out! — AthNexus Team</p>
  </td></tr>
</table></body></html>`;
}

function buildUpcomingReminderEmail(recipientName, event) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';
  const startDate = new Date(event.start_date);
  const month = startDate.toLocaleString('en-IN', { month: 'short' }).toUpperCase();
  const day = startDate.getDate();
  const dateStr = startDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeStr = startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const daysLeft = Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0d1520;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;margin:0 auto;background:#0d1520;">
  <tr><td style="padding:20px 24px;border-bottom:1px solid #1e2e40;">
    <span style="font-size:16px;font-weight:700;color:#a8e63d;">AthNexus</span>
  </td></tr>
  <tr><td style="padding:28px 24px 16px;background:#111a28;">
    <div style="display:inline-block;background:rgba(96,165,250,0.15);color:#93c5fd;border:1px solid rgba(96,165,250,0.3);font-size:11px;font-weight:800;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px;">📅 Coming Up!</div>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#fff;line-height:1.2;">${event.image_emoji || '🏆'} ${event.title}</h1>
    <p style="margin:0;font-size:15px;color:#8aaabf;">is starting in ${daysLeft > 0 ? daysLeft + ' day' + (daysLeft > 1 ? 's' : '') : 'less than a day'}.</p>
  </td></tr>
  <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #1e2e40;margin:0;"></td></tr>
  <tr><td style="padding:20px 24px 12px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:top;padding-right:14px;">
        <div style="background:#1e2e40;border-radius:8px;width:48px;text-align:center;overflow:hidden;">
          <div style="background:#a8e63d;padding:3px 0;font-size:10px;font-weight:700;color:#0d1520;text-transform:uppercase;">${month}</div>
          <div style="padding:6px 0;font-size:22px;font-weight:800;color:#fff;">${day}</div>
        </div>
      </td>
      <td style="vertical-align:middle;">
        <p style="margin:0;font-size:15px;font-weight:700;color:#fff;">${dateStr}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#5a8aaa;">${timeStr} IST</p>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:4px 24px 8px;">
    <p style="margin:4px 0;font-size:13px;color:#8aaabf;">📍 ${event.venue}, ${event.city}</p>
    <p style="margin:4px 0;font-size:13px;color:#8aaabf;">🏆 ${event.prize}</p>
  </td></tr>
  <tr><td style="padding:0 24px 16px;">
    <div style="background:#1e2e40;border-radius:10px;padding:14px 16px;margin-top:8px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#5a8aaa;text-transform:uppercase;letter-spacing:.05em;">Preparation Tips</p>
      <p style="margin:3px 0;font-size:13px;color:#c0d4e8;">• Arrive 30 minutes early</p>
      <p style="margin:3px 0;font-size:13px;color:#c0d4e8;">• Carry your ID proof</p>
      <p style="margin:3px 0;font-size:13px;color:#c0d4e8;">• Check venue on maps</p>
    </div>
  </td></tr>
  <tr><td style="padding:12px 24px 28px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="padding-right:10px;"><a href="${appUrl}/dashboard/events/${event.id}" style="display:inline-block;background:#a8e63d;color:#0d1520;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:700;">View Event Details</a></td>
      <td><a href="${appUrl}/dashboard/my-events" style="display:inline-block;background:#1e2e40;color:#c0d4e8;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;border:1px solid #2a3e52;">My Ticket</a></td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:16px 24px;border-top:1px solid #1e2e40;text-align:center;">
    <p style="margin:0;font-size:12px;color:#5a8aaa;">Best of luck, ${recipientName}! — AthNexus Team</p>
  </td></tr>
</table></body></html>`;
}



// ── User Management Endpoints ─────────────────────────────────

app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({});
    const mapped = users.map(u => ({
      athleteId: u._id,
      name: u.name,
      email: u.email,
      sport: u.profile?.sport || '-',
      status: u.status || 'ACTIVE',
      joinedAt: u.createdAt,
      department: u.profile?.department || '-',
      year: u.profile?.year || 1,
      totalRegistrations: 0, // Placeholder as relations not built
      approvedRegistrations: 0,
      bannedAt: u.bannedAt || null,
      banReason: u.banReason || null,
      frozenAt: u.frozenAt || null,
      frozenReason: u.frozenReason || null
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users from DB' });
  }
});

app.get('/api/admin/users/:id', async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json(u);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/admin/users/:id/ban', async (req, res) => {
  try {
    const { reason } = req.body;
    await User.findByIdAndUpdate(req.params.id, {
      status: 'BANNED',
      bannedAt: new Date(),
      banReason: reason || null
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.patch('/api/admin/users/:id/unban', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      status: 'ACTIVE',
      bannedAt: null,
      banReason: null
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.patch('/api/admin/users/:id/freeze', async (req, res) => {
  try {
    const { reason } = req.body;
    await User.findByIdAndUpdate(req.params.id, {
      status: 'FROZEN',
      frozenAt: new Date(),
      frozenReason: reason || null
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.patch('/api/admin/users/:id/unfreeze', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      status: 'ACTIVE',
      frozenAt: null,
      frozenReason: null
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/events', (req, res) => {
  const events = getEvents().map(event => ({
    ...event,
    status: computeStatus(event)
  }));
  res.json(events);
});

// Auto-compute status based on current date
app.get('/api/events/live', (req, res) => {
  const now = new Date();
  const events = getEvents()
    .filter(event => {
      const start = new Date(event.start_date);
      const end = new Date(event.end_date);
      return now >= start && now <= end && event.approval_status === "APPROVED";
    })
    .map(event => ({ ...event, status: "LIVE" }));
  res.json(events);
});

app.get('/api/events/upcoming', (req, res) => {
  const now = new Date();
  const events = getEvents()
    .filter(event => {
      const start = new Date(event.start_date);
      const deadline = new Date(event.deadline);
      return start > now && deadline > now && event.approval_status === "APPROVED";
    })
    .map(event => ({ ...event, status: computeStatus(event) }));
  res.json(events);
});

app.get('/api/events/deadline', (req, res) => {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + (72 * 60 * 60 * 1000));
  const events = getEvents()
    .filter(event => {
      const deadline = new Date(event.deadline);
      return deadline > now && deadline <= threeDaysFromNow && event.approval_status === "APPROVED";
    })
    .map(event => ({ ...event, status: computeStatus(event) }));
  res.json(events);
});

app.get('/api/events/:id', (req, res) => {
  const event = getEvents().find(e => e.id === req.params.id);
  if (event) {
    res.json({
      ...event,
      status: computeStatus(event),
      registered_count: event.registrations?.length || 0
    });
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// Admin: Custom event creation
app.post('/api/events/create', (req, res) => {
  const events = getEvents();
  const { created_by_role } = req.body;
  
  const newEvent = {
    ...req.body,
    id: req.body.id || `evt_${Date.now()}`,
    approval_status: created_by_role === 'athlete' ? 'PENDING' : 'APPROVED',
    registrations: [],
    created_at: new Date().toISOString()
  };
  events.push(newEvent);
  saveEvents(events);
  res.status(201).json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    events[index] = { ...events[index], ...req.body };
    saveEvents(events);
    res.json(events[index]);
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

app.delete('/api/events/:id', (req, res) => {
  const events = getEvents();
  const filteredEvents = events.filter(e => e.id !== req.params.id);
  if (events.length !== filteredEvents.length) {
    saveEvents(filteredEvents);
    res.json({ message: 'Event deleted' });
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// Athlete: Registration
app.post('/api/events/:id/register', (req, res) => {
  const { athleteId, athleteName, athleteEmail } = req.body;
  const events = getEvents();
  const index = events.findIndex(e => e.id === req.params.id);
  
  if (index !== -1) {
    const event = events[index];
    if (!event.registrations) event.registrations = [];
    
    // Check if already registered
    const existingIndex = event.registrations.findIndex(r => typeof r === 'string' ? r === athleteId : r.athleteId === athleteId);
    
    if (existingIndex === -1) {
      event.registrations.push({
        athleteId,
        athleteName,
        athleteEmail,
        registeredAt: new Date().toISOString(),
        reg_status: "PENDING"
      });
      event.registered_count = event.registrations.length;
      saveEvents(events);
      res.json({ success: true, message: 'Registered successfully' });
    } else {
      res.status(400).json({ error: 'Already registered' });
    }
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

app.delete('/api/events/:id/register', (req, res) => {
  const { athleteId } = req.body;
  const events = getEvents();
  const index = events.findIndex(e => e.id === req.params.id);
  
  if (index !== -1) {
    const event = events[index];
    if (event.registrations) {
      event.registrations = event.registrations.filter(r => 
        (typeof r === 'string' ? r : r.athleteId) !== athleteId
      );
      event.registered_count = event.registrations.length;
      saveEvents(events);
      res.json({ success: true, message: 'Registration cancelled' });
    } else {
      res.json({ success: true, message: 'Not registered' });
    }
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

app.get('/api/events/:id/registered', (req, res) => {
  const { athleteId } = req.query;
  const event = getEvents().find(e => e.id === req.params.id);
  if (event) {
    // registrations might be strings (legacy) or objects
    const regRecord = event.registrations?.find(r => 
      (typeof r === 'string' ? r : r.athleteId) === athleteId
    );
    if (regRecord) {
      res.json({ 
        registered: true, 
        reg_status: typeof regRecord === 'string' ? 'APPROVED' : regRecord.reg_status 
      });
    } else {
      res.json({ registered: false });
    }
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// ── VERIFIER ENDPOINTS ──

// Event Approval
app.get('/api/verifier/events/pending', (req, res) => {
  const events = getEvents().filter(e => e.approval_status === "PENDING");
  res.json(events);
});

app.patch('/api/verifier/events/:id/approve', async (req, res) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    events[index].approval_status = "APPROVED";
    saveEvents(events);
    res.json({ success: true, message: 'Event approved' });
    // Send email to event creator if athlete-created
    const event = events[index];
    if (event.created_by_role === 'athlete' && event.created_by) {
      const users = getUsers();
      const creator = users.find(u => u.email === event.created_by);
      if (creator) {
        try {
          await resend.emails.send({
            from: `AthNexus <${fromEmail}>`,
            to: creator.email,
            subject: `🎉 Your event is now live — ${event.title}`,
            html: buildEventApprovedEmail(creator.name, event)
          });
          console.log(`[RESEND] Event approval email sent to ${creator.email}`);
        } catch (e) {
          console.error('[RESEND] Event approval email failed', e.message);
        }
      }
    }
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

app.patch('/api/verifier/events/:id/reject', async (req, res) => {
  const { reason } = req.body;
  const events = getEvents();
  const index = events.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    events[index].approval_status = "REJECTED";
    events[index].reject_reason = reason;
    saveEvents(events);
    res.json({ success: true, message: 'Event rejected' });
    // Send email to event creator if athlete-created
    const event = events[index];
    if (event.created_by_role === 'athlete' && event.created_by) {
      const users = getUsers();
      const creator = users.find(u => u.email === event.created_by);
      if (creator) {
        try {
          await resend.emails.send({
            from: `AthNexus <${fromEmail}>`,
            to: creator.email,
            subject: `Update on your event submission — ${event.title}`,
            html: buildEventRejectedEmail(creator.name, event, reason)
          });
          console.log(`[RESEND] Event rejection email sent to ${creator.email}`);
        } catch (e) {
          console.error('[RESEND] Event rejection email failed', e.message);
        }
      }
    }
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// Registration Approval
app.get('/api/verifier/registrations/pending', (req, res) => {
  const events = getEvents();
  const pendingRegs = [];
  events.forEach(event => {
    if (event.registrations && Array.isArray(event.registrations)) {
      event.registrations.forEach(reg => {
        if (reg.reg_status === "PENDING") {
          pendingRegs.push({
            eventId: event.id,
            eventTitle: event.title,
            athleteId: reg.athleteId,
            athleteName: reg.athleteName,
            athleteEmail: reg.athleteEmail,
            registeredAt: reg.registeredAt,
            reg_status: reg.reg_status,
            formData: reg.formData || {}
          });
        }
      });
    }
  });
  res.json(pendingRegs);
});

// NEW: Processed (approved/rejected) registrations
app.get('/api/verifier/registrations/processed', (req, res) => {
  const events = getEvents();
  const processedRegs = [];
  events.forEach(event => {
    if (event.registrations && Array.isArray(event.registrations)) {
      event.registrations.forEach(reg => {
        if (reg.reg_status === 'APPROVED' || reg.reg_status === 'REJECTED') {
          processedRegs.push({
            eventId: event.id,
            eventTitle: event.title,
            athleteId: reg.athleteId,
            athleteName: reg.athleteName,
            athleteEmail: reg.athleteEmail,
            registeredAt: reg.registeredAt,
            reg_status: reg.reg_status,
            reject_reason: reg.reject_reason,
            processedAt: reg.processedAt || reg.registeredAt,
            formData: reg.formData || {}
          });
        }
      });
    }
  });
  processedRegs.sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime());
  res.json(processedRegs);
});

app.patch('/api/verifier/registrations/:eventId/:athleteId/approve', async (req, res) => {
  const { eventId, athleteId } = req.params;
  const events = getEvents();
  const eventIndex = events.findIndex(e => e.id === eventId);
  
  if (eventIndex !== -1) {
    const event = events[eventIndex];
    const regIndex = event.registrations?.findIndex(r => r.athleteId === athleteId);
    
    if (regIndex !== -1 && regIndex !== undefined) {
      event.registrations[regIndex].reg_status = "APPROVED";
      event.registrations[regIndex].processedAt = new Date().toISOString();
      saveEvents(events);
      
      // Send confirmation email
      const athleteEmail = event.registrations[regIndex].athleteEmail;
      const athleteName = event.registrations[regIndex].athleteName;
      if (athleteEmail) {
        try {
          await resend.emails.send({
            from: `AthNexus <${fromEmail}>`,
            to: athleteEmail,
            subject: `✅ Registration Confirmed — ${event.title}`,
            html: buildTournamentEmailHTML(athleteName, { ...event, tournamentName: event.title, hoursLeft: 0, slotsLeft: 0, totalSlots: 0 })
          });
          console.log(`[RESEND SUCCESS] Approval email sent to ${athleteEmail}`);
        } catch (e) {
          console.error(`[RESEND ERROR] Failed to send approval email`, e);
        }
      }
      
      res.json({ success: true, message: 'Registration approved' });
    } else {
      res.status(404).json({ error: 'Registration not found' });
    }
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

app.patch('/api/verifier/registrations/:eventId/:athleteId/reject', async (req, res) => {
  const { eventId, athleteId } = req.params;
  const { reason } = req.body;
  const events = getEvents();
  const eventIndex = events.findIndex(e => e.id === eventId);
  
  if (eventIndex !== -1) {
    const event = events[eventIndex];
    const regIndex = event.registrations?.findIndex(r => r.athleteId === athleteId);
    
    if (regIndex !== -1 && regIndex !== undefined) {
      event.registrations[regIndex].reg_status = "REJECTED";
      event.registrations[regIndex].reject_reason = reason;
      event.registrations[regIndex].processedAt = new Date().toISOString();
      saveEvents(events);
      
      // Send rejection email
      const athleteEmail = event.registrations[regIndex].athleteEmail;
      const athleteName = event.registrations[regIndex].athleteName;
      if (athleteEmail) {
        try {
          await resend.emails.send({
            from: `AthNexus Alerts <${fromEmail}>`,
            to: athleteEmail,
            subject: `Update on your registration — ${event.title}`,
            html: `<div style="font-family: Arial; padding: 20px;">
                    <h2>Update on your registration</h2>
                    <p>Hi ${athleteName},</p>
                    <p>Your registration for <strong>${event.title}</strong> was not approved.</p>
                    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                   </div>`
          });
          console.log(`[RESEND SUCCESS] Rejection email sent to ${athleteEmail}`);
        } catch (e) {
          console.error(`[RESEND ERROR] Failed to send rejection email`, e);
        }
      }
      
      res.json({ success: true, message: 'Registration rejected' });
    } else {
      res.status(404).json({ error: 'Registration not found' });
    }
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// Email: Send single tournament alert
app.post('/api/send-email', async (req, res) => {
  const { playerName, playerEmail, tournament } = req.body;
  
  console.log(`[RESEND ATTEMPT] To: ${playerEmail}, Tournament: ${tournament.tournamentName}`);

  try {
    const data = await resend.emails.send({
      from: `AthNexus Alerts <${fromEmail}>`,
      to: playerEmail,
      subject: `🏆 Tournament Alert: ${tournament.tournamentName}`,
      html: buildTournamentEmailHTML(playerName, tournament),
    });

    console.log(`[RESEND SUCCESS] ID: ${data.id}`);
    res.json({ success: true, id: data.id });
  } catch (error) {
    console.error(`[RESEND ERROR]`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const emailHtml = (recipientName, event) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
</head>
<body style="margin:0;padding:0;background:#0d1520;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" 
         style="max-width:500px;margin:0 auto;background:#0d1520;">
    
    <!-- HEADER -->
    <tr>
      <td style="padding:20px 24px;border-bottom:1px solid #1e2e40;">
        <span style="font-size:16px;font-weight:700;color:#a8e63d;">
          AthNexus
        </span>
      </td>
    </tr>

    <!-- HERO -->
    <tr>
      <td style="padding:32px 24px 20px;background:#111a28;">
        <p style="margin:0 0 4px;font-size:13px;color:#5a8aaa;
                  text-transform:uppercase;letter-spacing:.06em;">
          ${event.sport} · ${event.level}
        </p>
        <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;
                   color:#ffffff;line-height:1.2;">
          ${event.image_emoji || '🏆'} ${event.title}
        </h1>
        <p style="margin:0;font-size:18px;color:#8aaabf;font-weight:400;">
          is starting soon
        </p>
      </td>
    </tr>

    <!-- DIVIDER -->
    <tr>
      <td style="padding:0 24px;">
        <hr style="border:none;border-top:1px solid #1e2e40;margin:0;">
      </td>
    </tr>

    <!-- DATE ROW -->
    <tr>
      <td style="padding:20px 24px 12px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;padding-right:14px;">
              <div style="background:#1e2e40;border-radius:8px;
                          width:48px;text-align:center;overflow:hidden;">
                <div style="background:#a8e63d;padding:3px 0;
                            font-size:10px;font-weight:700;color:#0d1520;
                            text-transform:uppercase;letter-spacing:.05em;">
                  ${new Date(event.start_date)
                    .toLocaleString('en-IN',{month:'short'}).toUpperCase()}
                </div>
                <div style="padding:6px 0;font-size:22px;font-weight:800;
                            color:#ffffff;">
                  ${new Date(event.start_date).getDate()}
                </div>
              </div>
            </td>
            <td style="vertical-align:middle;">
              <p style="margin:0;font-size:16px;font-weight:700;
                        color:#ffffff;">
                ${new Date(event.start_date)
                  .toLocaleDateString('en-IN',{weekday:'long',
                  day:'numeric',month:'long'})}
              </p>
              <p style="margin:4px 0 0;font-size:13px;color:#5a8aaa;">
                ${new Date(event.start_date)
                  .toLocaleTimeString('en-IN',{hour:'2-digit',
                  minute:'2-digit'})} – 
                ${new Date(event.end_date)
                  .toLocaleTimeString('en-IN',{hour:'2-digit',
                  minute:'2-digit'})} IST
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- LOCATION ROW -->
    <tr>
      <td style="padding:4px 24px 20px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;padding-right:14px;">
              <div style="background:#1e2e40;border-radius:8px;
                          width:48px;height:48px;display:flex;
                          align-items:center;justify-content:center;
                          text-align:center;line-height:48px;
                          font-size:20px;">
                📍
              </div>
            </td>
            <td style="vertical-align:middle;">
              <p style="margin:0;font-size:16px;font-weight:700;
                        color:#ffffff;">
                ${event.venue}
              </p>
              <p style="margin:3px 0 0;font-size:13px;color:#5a8aaa;">
                ${event.city}, ${event.state}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- DIVIDER -->
    <tr>
      <td style="padding:0 24px;">
        <hr style="border:none;border-top:1px solid #1e2e40;margin:0;">
      </td>
    </tr>

    <!-- PRIZE ROW -->
    <tr>
      <td style="padding:16px 24px 8px;">
        <p style="margin:0;font-size:13px;color:#5a8aaa;">
          Prize: <span style="color:#ffd044;font-weight:600;">
          ${event.prize}</span>
        </p>
      </td>
    </tr>

    <!-- BUTTONS -->
    <tr>
      <td style="padding:12px 24px 32px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-right:10px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 
                         'http://localhost:5173'}/dashboard/events/${event.id}"
                 style="display:inline-block;background:#a8e63d;
                        color:#0d1520;text-decoration:none;
                        padding:12px 24px;border-radius:8px;
                        font-size:14px;font-weight:700;">
                View Event
              </a>
            </td>
            <td>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 
                         'http://localhost:5173'}/dashboard/my-events"
                 style="display:inline-block;background:#1e2e40;
                        color:#c0d4e8;text-decoration:none;
                        padding:12px 24px;border-radius:8px;
                        font-size:14px;font-weight:600;
                        border:1px solid #2a3e52;">
                My Events
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="padding:16px 24px;border-top:1px solid #1e2e40;
                 text-align:center;">
        <p style="margin:0;font-size:12px;color:#3a5a7a;">
          Sent by AthNexus Verifier Team
        </p>
        <p style="margin:4px 0 0;font-size:11px;color:#2a4a6a;">
          © 2026 AthNexus · Smart Athlete Enablement Platform
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
`;

// Email: Send bulk tournament alerts
app.post('/api/send-bulk-email', async (req, res) => {
  const { players, tournament, recipients, subject, message, eventId } = req.body;
  
  if (recipients && subject && message) {
    console.log(`[RESEND BULK CUSTOM] Sending custom email to ${recipients.length} recipients`);
    let sent = 0, failed = 0;
    
    let selectedEvent = null;
    if (eventId) {
      selectedEvent = getEvents().find(e => e.id === eventId);
    }
    
    for (const recipient of recipients) {
      try {
        let finalHtml = '';
        if (selectedEvent) {
          finalHtml = emailHtml(recipient.name, selectedEvent);
        } else {
          finalHtml = `<p>Hi ${recipient.name},</p>
                 <p>${message}</p>
                 <br/>
                 <small>— AthNexus Verifier Team</small>`;
        }

        const result = await resend.emails.send({
          from: `AthNexus <${fromEmail}>`,
          to: recipient.email,
          subject: subject,
          html: finalHtml
        });
        console.log(`[RESEND BULK CUSTOM SUCCESS] Sent to ${recipient.email}, ID: ${result.id}`);
        sent++;
      } catch (e) {
        console.error(`[RESEND BULK CUSTOM ERROR] Failed to send to ${recipient.email}:`, e.message || e);
        failed++;
      }
    }
    return res.json({ sent, failed });
  }

  console.log(`[RESEND BULK] Sending to ${players?.length || 0} players for ${tournament?.tournamentName}`);

  try {
    const results = await Promise.allSettled(
      (players || []).map(player => 
        resend.emails.send({
          from: `AthNexus Alerts <${fromEmail}>`,
          to: player.playerEmail,
          subject: `🏆 Tournament Alert: ${tournament.tournamentName}`,
          html: buildTournamentEmailHTML(player.playerName, tournament),
        })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`[RESEND BULK DONE] Sent: ${sent}, Failed: ${failed}`);
    res.json({
      success: true,
      sent,
      failed,
      results: results.map((r, i) => ({
        email: players[i].playerEmail,
        status: r.status,
        id: r.status === 'fulfilled' ? r.value.id : null,
        error: r.status === 'rejected' ? r.reason.message : null,
      }))
    });
  } catch (error) {
    console.error(`[RESEND BULK ERROR]`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update status endpoint (Legacy support)
app.post('/api/update-status', async (req, res) => {
    const { id, status, participant, tournament } = req.body;
    console.log(`[STATUS UPDATE] ID: ${id}, Status: ${status}`);
    
    // If status is approved, send email
    if (status === 'Approved' && participant?.email) {
        try {
            await resend.emails.send({
                from: `AthNexus Alerts <${fromEmail}>`,
                to: participant.email,
                subject: `Selection Confirmed: ${tournament || 'AthNexus Event'}`,
                html: buildTournamentEmailHTML(participant.name, { tournamentName: tournament || 'AthNexus Event', ...req.body })
            });
            console.log(`[RESEND SUCCESS] Selection email sent to ${participant.email}`);
        } catch (e) {
            console.error(`[RESEND ERROR] Failed to send selection email`, e);
        }
    }
    
    res.json({ success: true, message: 'Status updated' });
});

// ── Feature 5: Deadline & Upcoming Reminder Emails ──────────────
// TODO: call this via cron when deadline - 72h
app.post('/api/emails/deadline-reminder', async (req, res) => {
  const { eventId } = req.body;
  const events = getEvents();
  const event = events.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const deadline = new Date(event.deadline);
  const hoursLeft = (deadline.getTime() - Date.now()) / (1000 * 60 * 60);

  // Collect recipients: APPROVED registrants + sport-matched users who haven't registered
  const registeredEmails = new Set(
    (event.registrations || []).map(r => typeof r === 'string' ? r : r.athleteEmail)
  );
  const approvedRegs = (event.registrations || []).filter(r => typeof r !== 'string' && r.reg_status === 'APPROVED');
  const users = getUsers();
  const sportMatched = users.filter(u => u.sport === event.sport && !registeredEmails.has(u.email) && u.status === 'ACTIVE');

  const allRecipients = [
    ...approvedRegs.map(r => ({ email: r.athleteEmail, name: r.athleteName })),
    ...sportMatched.map(u => ({ email: u.email, name: u.name }))
  ];

  let sent = 0, failed = 0;
  for (const recipient of allRecipients) {
    try {
      await resend.emails.send({
        from: `AthNexus <${fromEmail}>`,
        to: recipient.email,
        subject: `⏰ Last chance! ${event.title} closes soon`,
        html: buildDeadlineReminderEmail(recipient.name, event, hoursLeft)
      });
      sent++;
    } catch (e) {
      console.error(`[RESEND] Deadline reminder failed for ${recipient.email}:`, e.message);
      failed++;
    }
  }
  console.log(`[RESEND] Deadline reminder: sent=${sent}, failed=${failed}`);
  res.json({ success: true, sent, failed });
});

// TODO: call this via cron when startDate - 24h
app.post('/api/emails/upcoming-reminder', async (req, res) => {
  const { eventId } = req.body;
  const events = getEvents();
  const event = events.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  // Send only to APPROVED registrants
  const approvedRegs = (event.registrations || []).filter(r => typeof r !== 'string' && r.reg_status === 'APPROVED');

  let sent = 0, failed = 0;
  for (const reg of approvedRegs) {
    try {
      await resend.emails.send({
        from: `AthNexus <${fromEmail}>`,
        to: reg.athleteEmail,
        subject: `📅 Your event is coming up — ${event.title}`,
        html: buildUpcomingReminderEmail(reg.athleteName, event)
      });
      sent++;
    } catch (e) {
      console.error(`[RESEND] Upcoming reminder failed for ${reg.athleteEmail}:`, e.message);
      failed++;
    }
  }
  console.log(`[RESEND] Upcoming reminder: sent=${sent}, failed=${failed}`);
  res.json({ success: true, sent, failed });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
