/**
 * Normalizer + Validator — Cleans and validates scraped event data.
 *
 * Responsibilities:
 *   1. Parse messy date strings into ISO Date objects
 *   2. Clean text (trim, collapse whitespace)
 *   3. Validate required fields (title, start_date, event_url or dedup key)
 *   4. Log & skip invalid records
 */

const log = require('./logger.cjs');

// ── Date Parsing ────────────────────────────────────────────────

const MONTH_MAP = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Parse Somaiya's date format:
 *   "6th Nov 2025 10 : 53 AM 7th Nov 2025 10 : 53 AM"
 * into { startDate: Date, endDate: Date }
 */
function parseSomaiyaDateText(text) {
  if (!text) return { startDate: null, endDate: null };

  // Clean up the weird spacing around colons in times
  let cleaned = text.replace(/\s*:\s*/g, ':').trim();

  // Pattern: "6th Nov 2025 10:53 AM"
  const dateTimePattern = /(\d{1,2})(?:st|nd|rd|th)?\s+(\w+)\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)/gi;
  const matches = [...cleaned.matchAll(dateTimePattern)];

  if (matches.length === 0) {
    // Try simpler pattern without time: "6th Nov 2025"
    const dateOnlyPattern = /(\d{1,2})(?:st|nd|rd|th)?\s+(\w+)\s+(\d{4})/gi;
    const simpleMatches = [...cleaned.matchAll(dateOnlyPattern)];

    if (simpleMatches.length >= 1) {
      const startDate = buildDate(simpleMatches[0]);
      const endDate = simpleMatches.length >= 2 ? buildDate(simpleMatches[1]) : startDate;
      return { startDate, endDate };
    }

    return { startDate: null, endDate: null };
  }

  const startDate = buildDateTime(matches[0]);
  const endDate = matches.length >= 2 ? buildDateTime(matches[1]) : startDate;

  return { startDate, endDate };
}

function buildDate(match) {
  const day = parseInt(match[1], 10);
  const month = MONTH_MAP[match[2].toLowerCase()];
  const year = parseInt(match[3], 10);

  if (month === undefined || isNaN(day) || isNaN(year)) return null;

  return new Date(year, month, day);
}

function buildDateTime(match) {
  const day = parseInt(match[1], 10);
  const month = MONTH_MAP[match[2].toLowerCase()];
  const year = parseInt(match[3], 10);
  let hour = parseInt(match[4], 10);
  const minute = parseInt(match[5], 10);
  const ampm = (match[6] || '').toUpperCase();

  if (month === undefined || isNaN(day) || isNaN(year)) return null;

  // Convert 12h to 24h
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  return new Date(year, month, day, hour, minute);
}

// ── Text Cleaning ───────────────────────────────────────────────

function cleanText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/\s+/g, ' ')        // collapse whitespace
    .replace(/\n+/g, ' ')        // newlines to spaces
    .replace(/^\s+|\s+$/g, '')   // trim
    .replace(/\u00A0/g, ' ');    // non-breaking spaces
}

// ── Validation ──────────────────────────────────────────────────

const REQUIRED_FIELDS = ['title', 'start_date'];

function validateEvent(event) {
  const errors = [];

  if (!event.title || event.title.length < 3) {
    errors.push('Missing or too-short title');
  }

  if (!event.start_date || isNaN(new Date(event.start_date).getTime())) {
    errors.push('Missing or invalid start_date');
  }

  // Need at least one dedup key
  if (!event.external_id && !event.event_url && !event.dedup_hash) {
    errors.push('No dedup key available (external_id, event_url, or dedup_hash)');
  }

  return { valid: errors.length === 0, errors };
}

// ── Main Normalize Function ─────────────────────────────────────

/**
 * Normalize a raw parsed event into the canonical schema.
 * @param {object} raw - Raw event from parser
 * @returns {{ event: object|null, valid: boolean, errors: string[] }}
 */
function normalizeEvent(raw) {
  // Parse dates
  const { startDate, endDate } = parseSomaiyaDateText(raw.date_text);

  const normalized = {
    title:                cleanText(raw.title),
    event_url:            raw.event_url || null,
    external_id:          raw.external_id || null,
    source_name:          raw.source_name || 'Somaiya Sports Academy',
    source_page:          raw.source_page || '',
    institute_department: cleanText(raw.institute_department) || 'Somaiya Sports Academy',
    event_type:           cleanText(raw.event_type),
    audience_type:        cleanText(raw.audience_type),
    start_date:           startDate,
    end_date:             endDate || startDate,
    location:             cleanText(raw.location),
    summary:              cleanText(raw.summary || ''),
    image_url:            (raw.image_url || '').trim(),
    scraped_at:           new Date(),
    is_active:            true,
  };

  // Validate
  const { valid, errors } = validateEvent(normalized);

  if (!valid) {
    log.warn(`Validation failed for "${normalized.title || 'UNKNOWN'}"`, { errors });
    return { event: null, valid: false, errors };
  }

  return { event: normalized, valid: true, errors: [] };
}

/**
 * Normalize an array of raw events.
 * Returns { normalized: object[], skipped: object[], validationReport: string[] }
 */
function normalizeAll(rawEvents) {
  const normalized = [];
  const skipped = [];
  const validationReport = [];

  for (const raw of rawEvents) {
    const result = normalizeEvent(raw);

    if (result.valid && result.event) {
      normalized.push(result.event);
    } else {
      skipped.push({ raw, errors: result.errors });
      validationReport.push(`SKIP: "${raw.title || 'UNKNOWN'}" — ${result.errors.join('; ')}`);
    }
  }

  log.info('Normalization complete', {
    total: rawEvents.length,
    valid: normalized.length,
    skipped: skipped.length,
  });

  return { normalized, skipped, validationReport };
}

module.exports = { normalizeEvent, normalizeAll, parseSomaiyaDateText, cleanText, validateEvent };
