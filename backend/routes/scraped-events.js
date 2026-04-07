/**
 * Scraped Events API Router
 *
 * Endpoints:
 *   GET /api/scraped-events          — List events (paginated, filterable)
 *   GET /api/scraped-events/:id      — Single event by MongoDB _id
 *   GET /api/scraped-events/stats    — Scraper metrics & run history
 */

const express = require('express');
const router = express.Router();
const ScrapedEvent = require('../models/ScrapedEvent');
const ScrapeRun = require('../models/ScrapeRun');

// ── GET /api/scraped-events ─────────────────────────────────────
// Filters: date_from, date_to, event_type, audience_type, keyword, active
// Pagination: page (1-indexed), limit (default 20, max 100)
// Sort: sort_by (default: start_date), order (asc|desc, default: desc)

router.get('/', async (req, res) => {
  try {
    const {
      date_from,
      date_to,
      event_type,
      audience_type,
      keyword,
      active,
      page = 1,
      limit = 20,
      sort_by = 'start_date',
      order = 'desc',
    } = req.query;

    // ── Build query ──────────────────────────────────────────
    const query = {};

    // Active filter (default: only active)
    if (active === 'false') {
      // show all including archived
    } else if (active === 'all') {
      // show all
    } else {
      query.is_active = true;
    }

    // Date range
    if (date_from || date_to) {
      query.start_date = {};
      if (date_from) query.start_date.$gte = new Date(date_from);
      if (date_to) query.start_date.$lte = new Date(date_to);
    }

    // Event type
    if (event_type) {
      query.event_type = { $regex: event_type, $options: 'i' };
    }

    // Audience type
    if (audience_type) {
      query.audience_type = { $regex: audience_type, $options: 'i' };
    }

    // Keyword search (title, location, summary)
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } },
        { summary: { $regex: keyword, $options: 'i' } },
      ];
    }

    // ── Pagination ───────────────────────────────────────────
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // ── Sort ─────────────────────────────────────────────────
    const allowedSorts = ['start_date', 'title', 'event_type', 'createdAt', 'updatedAt'];
    const sortField = allowedSorts.includes(sort_by) ? sort_by : 'start_date';
    const sortOrder = order === 'asc' ? 1 : -1;

    // ── Execute ──────────────────────────────────────────────
    const [events, totalCount] = await Promise.all([
      ScrapedEvent.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ScrapedEvent.countDocuments(query),
    ]);

    res.json({
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        hasNext: skip + limitNum < totalCount,
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    console.error('[SCRAPED-EVENTS] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch scraped events' });
  }
});

// ── GET /api/scraped-events/stats ───────────────────────────────
//    Must be BEFORE /:id to avoid route conflict

router.get('/stats', async (req, res) => {
  try {
    const [totalEvents, activeEvents, recentRuns, eventTypeCounts] = await Promise.all([
      ScrapedEvent.countDocuments({}),
      ScrapedEvent.countDocuments({ is_active: true }),
      ScrapeRun.find({})
        .sort({ started_at: -1 })
        .limit(10)
        .lean(),
      ScrapedEvent.aggregate([
        { $match: { is_active: true } },
        { $group: { _id: '$event_type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const latestRun = recentRuns[0] || null;

    res.json({
      overview: {
        total_events: totalEvents,
        active_events: activeEvents,
        archived_events: totalEvents - activeEvents,
      },
      latest_run: latestRun ? {
        status: latestRun.status,
        started_at: latestRun.started_at,
        finished_at: latestRun.finished_at,
        runtime_ms: latestRun.runtime_ms,
        fetched: latestRun.fetched_count,
        inserted: latestRun.inserted_count,
        updated: latestRun.updated_count,
        unchanged: latestRun.unchanged_count,
        failed: latestRun.failed_count,
        skipped: latestRun.skipped_count,
      } : null,
      recent_runs: recentRuns.map(r => ({
        _id: r._id,
        status: r.status,
        started_at: r.started_at,
        runtime_ms: r.runtime_ms,
        fetched: r.fetched_count,
        inserted: r.inserted_count,
        updated: r.updated_count,
        failed: r.failed_count,
      })),
      event_type_breakdown: eventTypeCounts,
    });
  } catch (err) {
    console.error('[SCRAPED-EVENTS] Stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── GET /api/scraped-events/:id ─────────────────────────────────

router.get('/:id', async (req, res) => {
  try {
    const event = await ScrapedEvent.findById(req.params.id).lean();
    if (!event) {
      return res.status(404).json({ error: 'Scraped event not found' });
    }
    res.json(event);
  } catch (err) {
    // Handle invalid ObjectId
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid event ID format' });
    }
    console.error('[SCRAPED-EVENTS] Detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

module.exports = router;
