const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

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

// Helper to get events
const getEvents = () => {
  if (fs.existsSync(eventsFilePath)) {
    return JSON.parse(fs.readFileSync(eventsFilePath, 'utf8'));
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

// Helper to save events
const saveEvents = (events) => {
  fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2), 'utf8');
};

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

app.patch('/api/verifier/events/:id/approve', (req, res) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    events[index].approval_status = "APPROVED";
    saveEvents(events);
    res.json({ success: true, message: 'Event approved' });
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

app.patch('/api/verifier/events/:id/reject', (req, res) => {
  const { reason } = req.body;
  const events = getEvents();
  const index = events.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    events[index].approval_status = "REJECTED";
    events[index].reject_reason = reason;
    saveEvents(events);
    res.json({ success: true, message: 'Event rejected' });
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
            registeredAt: reg.registeredAt
          });
        }
      });
    }
  });
  res.json(pendingRegs);
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
      saveEvents(events);
      
      // Send confirmation email
      const athleteEmail = event.registrations[regIndex].athleteEmail;
      const athleteName = event.registrations[regIndex].athleteName;
      if (athleteEmail) {
        try {
          await resend.emails.send({
            from: 'AthNexus Alerts <onboarding@resend.dev>',
            to: athleteEmail,
            subject: `✅ Your registration is confirmed — ${event.title}`,
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
      saveEvents(events);
      
      // Send rejection email
      const athleteEmail = event.registrations[regIndex].athleteEmail;
      const athleteName = event.registrations[regIndex].athleteName;
      if (athleteEmail) {
        try {
          // Reusing the same helper, though we could make a dedicated one
          await resend.emails.send({
            from: 'AthNexus Alerts <onboarding@resend.dev>',
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
      from: 'AthNexus Alerts <onboarding@resend.dev>',
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

// Email: Send bulk tournament alerts
app.post('/api/send-bulk-email', async (req, res) => {
  const { players, tournament, recipients, subject, message } = req.body;
  
  if (recipients && subject && message) {
    console.log(`[RESEND BULK CUSTOM] Sending custom email to ${recipients.length} recipients`);
    let sent = 0, failed = 0;
    
    for (const recipient of recipients) {
      try {
        await resend.emails.send({
          from: 'AthNexus <onboarding@resend.dev>',
          to: recipient.email,
          subject: subject,
          html: `<p>Hi ${recipient.name},</p>
                 <p>${message}</p>
                 <br/>
                 <small>— AthNexus Verifier Team</small>`
        });
        sent++;
      } catch (e) {
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
          from: 'AthNexus Alerts <onboarding@resend.dev>',
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
                from: 'AthNexus Alerts <onboarding@resend.dev>',
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
