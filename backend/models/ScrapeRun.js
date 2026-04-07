const mongoose = require('mongoose');

const ScrapeRunSchema = new mongoose.Schema({
  source_name:     { type: String, default: 'Somaiya Sports Academy' },
  status:          { type: String, enum: ['RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED'], default: 'RUNNING' },
  started_at:      { type: Date, default: Date.now },
  finished_at:     { type: Date },
  runtime_ms:      { type: Number },

  // ── Metrics ───────────────────────────────────────────────
  fetched_count:   { type: Number, default: 0 },
  parsed_count:    { type: Number, default: 0 },
  inserted_count:  { type: Number, default: 0 },
  updated_count:   { type: Number, default: 0 },
  unchanged_count: { type: Number, default: 0 },
  failed_count:    { type: Number, default: 0 },
  skipped_count:   { type: Number, default: 0 },  // validation failures

  // ── Diagnostics ───────────────────────────────────────────
  errors:          [{ type: String }],
  validation_report: [{ type: String }],

  // ── Lock ──────────────────────────────────────────────────
  lock_key:        { type: String, unique: true, sparse: true },
}, {
  timestamps: true,
});

ScrapeRunSchema.index({ started_at: -1 });
ScrapeRunSchema.index({ status: 1 });

module.exports = mongoose.model('ScrapeRun', ScrapeRunSchema);
