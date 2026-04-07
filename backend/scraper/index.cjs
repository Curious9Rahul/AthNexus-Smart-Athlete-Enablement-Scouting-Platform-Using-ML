#!/usr/bin/env node
/**
 * Scraper Pipeline Orchestrator
 *
 * Usage:
 *   node backend/scraper/index.cjs              # full pipeline
 *   node backend/scraper/index.cjs --dry-run    # fetch + parse + normalize only, no DB writes
 *   node backend/scraper/index.cjs --json       # output events as JSON to stdout
 *
 * Environment:
 *   MONGO_URI          — MongoDB connection string (default: mongodb://localhost:27017/athnexus)
 *   SCRAPER_LOG_LEVEL  — DEBUG | INFO | WARN | ERROR (default: INFO)
 */

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env from backend/.env or backend/.env.example
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const log = require('./logger.cjs');
const { fetchAllPages } = require('./fetcher.cjs');
const { parseAllPages } = require('./parser.cjs');
const { normalizeAll } = require('./normalizer.cjs');
const { upsertAll, markStaleInactive } = require('./upserter.cjs');
const ScrapeRun = require('../models/ScrapeRun');

// ── CLI flags ──────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const JSON_OUTPUT = args.includes('--json');

// ── Lock management ────────────────────────────────────────────
const LOCK_KEY = 'somaiya-scrape-lock';

async function acquireLock() {
  try {
    const existing = await ScrapeRun.findOne({
      lock_key: LOCK_KEY,
      status: 'RUNNING',
    });

    if (existing) {
      // Check if the lock is stale (> 10 minutes old)
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
      if (existing.started_at > tenMinAgo) {
        log.warn('Another scrape run is still in progress. Exiting.');
        return null;
      }
      // Stale lock — force-release
      existing.status = 'FAILED';
      existing.errors = [...(existing.errors || []), 'Stale lock detected and released'];
      existing.finished_at = new Date();
      existing.lock_key = null;
      await existing.save();
      log.warn('Released stale lock from previous run');
    }

    const run = new ScrapeRun({
      lock_key: LOCK_KEY,
      status: 'RUNNING',
      started_at: new Date(),
    });
    await run.save();
    return run;
  } catch (err) {
    if (err.code === 11000) {
      log.warn('Lock already held (duplicate key). Exiting.');
      return null;
    }
    throw err;
  }
}

async function releaseLock(run, status, metrics = {}) {
  run.status = status;
  run.finished_at = new Date();
  run.runtime_ms = run.finished_at.getTime() - run.started_at.getTime();
  run.lock_key = null; // release lock

  Object.assign(run, metrics);
  await run.save();
}

// ── Main Pipeline ──────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  log.info('═══════════════════════════════════════════════════════');
  log.info('AthNexus Scraper Pipeline — Starting', {
    dryRun: DRY_RUN,
    jsonOutput: JSON_OUTPUT,
  });

  // ── Step 0: Connect to MongoDB ─────────────────────────────
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/athnexus';

  if (!DRY_RUN) {
    try {
      await mongoose.connect(mongoUri);
      log.info('Connected to MongoDB', { uri: mongoUri.replace(/\/\/.*@/, '//***@') });
    } catch (err) {
      log.alert('Failed to connect to MongoDB', { error: err.message });
      process.exit(1);
    }
  }

  // ── Step 0.5: Acquire lock ─────────────────────────────────
  let run = null;
  if (!DRY_RUN) {
    run = await acquireLock();
    if (!run) {
      log.warn('Could not acquire lock. Exiting gracefully.');
      await mongoose.disconnect();
      process.exit(0);
    }
  }

  try {
    // ── Step 1: Fetch ──────────────────────────────────────────
    log.info('Step 1/4: Fetching pages from Somaiya...');
    const { pages, fetchedCount, errors: fetchErrors } = await fetchAllPages();

    if (fetchedCount === 0) {
      log.alert('ZERO pages fetched — source may be unavailable', {
        errors: fetchErrors,
      });

      if (run) {
        await releaseLock(run, 'FAILED', {
          fetched_count: 0,
          errors: ['Zero pages fetched — source may be unavailable', ...fetchErrors],
        });
      }

      await mongoose.disconnect();
      process.exit(1);
    }

    // ── Step 2: Parse ──────────────────────────────────────────
    log.info('Step 2/4: Parsing HTML...');
    const rawEvents = parseAllPages(pages);

    if (rawEvents.length === 0) {
      log.alert('ZERO events parsed — HTML structure may have changed', {
        pagesDownloaded: fetchedCount,
      });

      if (run) {
        await releaseLock(run, 'FAILED', {
          fetched_count: fetchedCount,
          parsed_count: 0,
          errors: ['Zero events parsed — possible HTML structure drift'],
        });
      }

      await mongoose.disconnect();
      process.exit(1);
    }

    // ── Step 3: Normalize + Validate ───────────────────────────
    log.info('Step 3/4: Normalizing + validating...');
    const { normalized, skipped, validationReport } = normalizeAll(rawEvents);

    // ── JSON output mode ─────────────────────────────────────
    if (JSON_OUTPUT) {
      console.log(JSON.stringify(normalized, null, 2));
    }

    // ── Step 4: Upsert ─────────────────────────────────────────
    if (DRY_RUN) {
      log.info('DRY RUN — skipping database upsert', {
        wouldUpsert: normalized.length,
        skipped: skipped.length,
      });

      if (!JSON_OUTPUT) {
        console.log('\n--- DRY RUN SUMMARY ---');
        console.log(`Pages fetched:      ${fetchedCount}`);
        console.log(`Events parsed:      ${rawEvents.length}`);
        console.log(`Events normalized:  ${normalized.length}`);
        console.log(`Events skipped:     ${skipped.length}`);
        console.log('\nValidation Report:');
        validationReport.forEach(r => console.log(`  ${r}`));
        console.log('\nSample events:');
        normalized.slice(0, 3).forEach(e => {
          console.log(`  • ${e.title} | ${e.start_date} | ${e.location}`);
        });
      }
    } else {
      log.info('Step 4/4: Upserting to database...');
      const metrics = await upsertAll(normalized);

      // Mark stale events as inactive
      const staleCount = await markStaleInactive(new Date(startTime));

      // ── Record run ─────────────────────────────────────────
      const status = metrics.failed > normalized.length * 0.5 ? 'PARTIAL' : 'SUCCESS';

      await releaseLock(run, status, {
        fetched_count: fetchedCount,
        parsed_count: rawEvents.length,
        inserted_count: metrics.inserted,
        updated_count: metrics.updated,
        unchanged_count: metrics.unchanged,
        failed_count: metrics.failed,
        skipped_count: skipped.length,
        validation_report: validationReport,
        errors: fetchErrors,
      });

      // ── Alert checks ───────────────────────────────────────
      if (metrics.failed > 5) {
        log.alert(`High failure count: ${metrics.failed} events failed to upsert`);
      }

      if (normalized.length < 10 && rawEvents.length > 20) {
        log.alert('Possible schema parse drift — many events failed validation', {
          parsed: rawEvents.length,
          normalized: normalized.length,
        });
      }

      // ── Print summary ──────────────────────────────────────
      const runtime = Date.now() - startTime;
      log.info('═══════════════════════════════════════════════════════');
      log.info('Pipeline complete', {
        runtime_ms: runtime,
        fetched: fetchedCount,
        parsed: rawEvents.length,
        inserted: metrics.inserted,
        updated: metrics.updated,
        unchanged: metrics.unchanged,
        failed: metrics.failed,
        skipped: skipped.length,
        staleArchived: staleCount,
      });
    }

  } catch (err) {
    log.alert('Pipeline crashed', { error: err.message, stack: err.stack });

    if (run) {
      await releaseLock(run, 'FAILED', {
        errors: [`Pipeline crash: ${err.message}`],
      });
    }

    process.exitCode = 1;
  } finally {
    if (!DRY_RUN) {
      await mongoose.disconnect();
    }
  }
}

main();
