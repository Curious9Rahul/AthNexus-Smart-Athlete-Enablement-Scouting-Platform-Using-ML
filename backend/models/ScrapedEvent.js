const mongoose = require('mongoose');
const crypto = require('crypto');

const ScrapedEventSchema = new mongoose.Schema({
  // ── Source tracking ───────────────────────────────────────
  source_name:          { type: String, default: 'Somaiya Sports Academy' },
  source_page:          { type: String, default: 'https://sportsacademy.somaiya.edu/en/events-and-updates/events/' },
  external_id:          { type: String, index: true, sparse: true },
  event_url:            { type: String, index: true, unique: true, sparse: true },
  dedup_hash:           { type: String, index: true, sparse: true },

  // ── Core event data ───────────────────────────────────────
  title:                { type: String, required: true },
  institute_department: { type: String, default: 'Somaiya Sports Academy' },
  event_type:           { type: String, default: '' },    // Sports, Cultural, etc.
  audience_type:        { type: String, default: '' },    // Students, Staff, etc.
  start_date:           { type: Date, required: true },
  end_date:             { type: Date },
  location:             { type: String, default: '' },
  summary:              { type: String, default: '' },
  image_url:            { type: String, default: '' },

  // ── Metadata ──────────────────────────────────────────────
  scraped_at:           { type: Date, default: Date.now },
  is_active:            { type: Boolean, default: true },
}, {
  timestamps: true,   // adds createdAt, updatedAt
});

// ── Indexes for query performance ───────────────────────────
ScrapedEventSchema.index({ start_date: -1 });
ScrapedEventSchema.index({ event_type: 1 });
ScrapedEventSchema.index({ updatedAt: -1 });
ScrapedEventSchema.index({ is_active: 1, start_date: -1 });

// ── Static helper: compute dedup hash ───────────────────────
ScrapedEventSchema.statics.computeDedupHash = function (title, startDate, sourceName) {
  const raw = `${(title || '').trim().toLowerCase()}|${startDate}|${(sourceName || '').trim().toLowerCase()}`;
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
};

module.exports = mongoose.model('ScrapedEvent', ScrapedEventSchema);
