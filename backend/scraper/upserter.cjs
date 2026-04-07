/**
 * Upserter — Idempotent upsert of normalized events into MongoDB.
 *
 * Dedup priority:
 *   1. external_id (from Somaiya URL path)
 *   2. event_url (full URL)
 *   3. dedup_hash (SHA256 of title + start_date + source_name)
 *
 * Returns metrics: { inserted, updated, unchanged, failed }
 */

const ScrapedEvent = require('../models/ScrapedEvent');
const log = require('./logger.cjs');
const crypto = require('crypto');

/**
 * Compute dedup hash from event fields.
 */
function computeDedupHash(title, startDate, sourceName) {
  const raw = `${(title || '').trim().toLowerCase()}|${startDate}|${(sourceName || '').trim().toLowerCase()}`;
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

/**
 * Check if two events have meaningful differences worth updating.
 */
function hasChanges(existing, incoming) {
  const fieldsToCheck = [
    'title', 'event_type', 'audience_type', 'location',
    'summary', 'image_url', 'institute_department',
  ];

  for (const field of fieldsToCheck) {
    const a = (existing[field] || '').toString().trim();
    const b = (incoming[field] || '').toString().trim();
    if (a !== b) return true;
  }

  // Check dates — compare timestamps
  if (existing.start_date && incoming.start_date) {
    if (new Date(existing.start_date).getTime() !== new Date(incoming.start_date).getTime()) return true;
  }
  if (existing.end_date && incoming.end_date) {
    if (new Date(existing.end_date).getTime() !== new Date(incoming.end_date).getTime()) return true;
  }

  return false;
}

/**
 * Upsert a single normalized event.
 * @returns {'inserted'|'updated'|'unchanged'|'failed'}
 */
async function upsertOne(event) {
  try {
    // Compute dedup hash as fallback
    const dedupHash = computeDedupHash(event.title, event.start_date, event.source_name);

    // ── Find existing ──────────────────────────────────────
    let existing = null;

    // Priority 1: external_id
    if (event.external_id) {
      existing = await ScrapedEvent.findOne({ external_id: event.external_id });
    }

    // Priority 2: event_url
    if (!existing && event.event_url) {
      existing = await ScrapedEvent.findOne({ event_url: event.event_url });
    }

    // Priority 3: dedup_hash
    if (!existing) {
      existing = await ScrapedEvent.findOne({ dedup_hash: dedupHash });
    }

    // ── Insert or Update ───────────────────────────────────
    if (!existing) {
      // INSERT
      const doc = new ScrapedEvent({
        ...event,
        dedup_hash: dedupHash,
      });
      await doc.save();
      return 'inserted';
    }

    // Check for changes
    if (hasChanges(existing, event)) {
      // UPDATE
      Object.assign(existing, {
        ...event,
        dedup_hash: dedupHash,
        scraped_at: new Date(),
      });
      await existing.save();
      return 'updated';
    }

    // Touch scraped_at even if unchanged, to track last-seen
    existing.scraped_at = new Date();
    await existing.save();
    return 'unchanged';

  } catch (err) {
    // Handle duplicate key errors gracefully
    if (err.code === 11000) {
      log.debug(`Duplicate key during upsert for "${event.title}" — treating as unchanged`);
      return 'unchanged';
    }

    log.error(`Upsert failed for "${event.title}"`, { error: err.message });
    return 'failed';
  }
}

/**
 * Upsert all normalized events.
 * @param {object[]} events - Array of normalized event objects
 * @returns {{ inserted: number, updated: number, unchanged: number, failed: number }}
 */
async function upsertAll(events) {
  const metrics = { inserted: 0, updated: 0, unchanged: 0, failed: 0 };

  for (const event of events) {
    const result = await upsertOne(event);
    metrics[result]++;
  }

  log.info('Upsert complete', metrics);
  return metrics;
}

/**
 * Mark events as inactive if they weren't seen in this scrape run.
 * Events whose scraped_at is older than the run start are likely removed from source.
 * @param {Date} runStartTime - When this scrape run began
 * @param {number} graceDays - How many days before marking inactive (default: 7)
 */
async function markStaleInactive(runStartTime, graceDays = 7) {
  const cutoff = new Date(runStartTime.getTime() - (graceDays * 24 * 60 * 60 * 1000));

  const result = await ScrapedEvent.updateMany(
    {
      is_active: true,
      scraped_at: { $lt: cutoff },
      source_name: 'Somaiya Sports Academy',
    },
    { $set: { is_active: false } }
  );

  if (result.modifiedCount > 0) {
    log.info(`Marked ${result.modifiedCount} stale events as inactive`, {
      cutoffDate: cutoff.toISOString(),
    });
  }

  return result.modifiedCount;
}

module.exports = { upsertOne, upsertAll, markStaleInactive, computeDedupHash };
