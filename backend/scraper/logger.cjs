/**
 * Structured JSON logger for scraper pipeline.
 * Outputs newline-delimited JSON for easy parsing by monitoring tools.
 */

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, ALERT: 4 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.SCRAPER_LOG_LEVEL || 'INFO'] || LOG_LEVELS.INFO;

function log(level, message, meta = {}) {
  if (LOG_LEVELS[level] < CURRENT_LEVEL) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'athnexus-scraper',
    message,
    ...meta,
  };

  const output = JSON.stringify(entry);

  if (level === 'ERROR' || level === 'ALERT') {
    process.stderr.write(output + '\n');
  } else {
    process.stdout.write(output + '\n');
  }
}

module.exports = {
  debug: (msg, meta) => log('DEBUG', msg, meta),
  info:  (msg, meta) => log('INFO', msg, meta),
  warn:  (msg, meta) => log('WARN', msg, meta),
  error: (msg, meta) => log('ERROR', msg, meta),
  alert: (msg, meta) => log('ALERT', msg, meta),
};
