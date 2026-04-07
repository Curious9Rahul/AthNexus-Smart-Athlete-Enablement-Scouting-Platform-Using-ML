/**
 * Fetcher — Paginated HTTP fetch from Somaiya Sports Academy events.
 *
 * Strategy:
 *   POST https://sportsacademy.somaiya.edu/sports/events_ajax_new/{offset}
 *   Content-Type: application/x-www-form-urlencoded
 *   Body: page_no={offset}&institute_check=34,34
 *
 * Returns HTML fragments. Paginate by 10 until empty response.
 */

const axios = require('axios');
const log = require('./logger.cjs');

const BASE_URL = 'https://sportsacademy.somaiya.edu/sports/events_ajax_new';
const PAGE_SIZE = 10;
const MAX_PAGES = 20;           // safety cap: 200 events max
const REQUEST_TIMEOUT = 15000;  // 15s
const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 2000;
const RATE_LIMIT_MS = 800;      // delay between requests

const USER_AGENT = 'AthNexus-Scraper/1.0 (+https://github.com/AthNexus; educational-project)';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch a single page of events HTML.
 * @param {number} offset - Page offset (0, 10, 20, ...)
 * @returns {string|null} HTML string or null on failure
 */
async function fetchPage(offset, retries = RETRY_COUNT) {
  const url = `${BASE_URL}/${offset}`;
  const body = `page_no=${offset}&institute_check=34,34`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log.debug(`Fetching page offset=${offset}, attempt ${attempt}/${retries}`);

      const response = await axios({
        method: 'POST',
        url,
        data: body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT,
          'Accept': 'text/html, */*',
          'Referer': 'https://sportsacademy.somaiya.edu/en/events-and-updates/events/',
        },
        timeout: REQUEST_TIMEOUT,
        responseType: 'text',
      });

      if (response.status === 200 && response.data) {
        log.debug(`Page offset=${offset} fetched successfully`, { bytes: response.data.length });
        return response.data;
      }

      log.warn(`Unexpected status ${response.status} for offset=${offset}`);
      return null;
    } catch (err) {
      log.warn(`Fetch failed for offset=${offset}, attempt ${attempt}`, {
        error: err.message,
        code: err.code,
      });

      if (attempt < retries) {
        await sleep(RETRY_DELAY_MS * attempt); // exponential-ish backoff
      }
    }
  }

  log.error(`All ${retries} retries exhausted for offset=${offset}`);
  return null;
}

/**
 * Fetch ALL pages of events.
 * @returns {{ pages: string[], fetchedCount: number, errors: string[] }}
 */
async function fetchAllPages() {
  const pages = [];
  const errors = [];
  let offset = 0;
  let consecutiveEmpty = 0;

  log.info('Starting paginated fetch from Somaiya Sports Academy');

  for (let pageNum = 0; pageNum < MAX_PAGES; pageNum++) {
    const html = await fetchPage(offset);

    if (!html || html.trim().length < 50) {
      consecutiveEmpty++;
      log.info(`Empty/short response at offset=${offset}. Consecutive empty: ${consecutiveEmpty}`);

      if (consecutiveEmpty >= 2) {
        log.info('Two consecutive empty pages — assuming end of data');
        break;
      }
    } else {
      consecutiveEmpty = 0;
      pages.push(html);
    }

    offset += PAGE_SIZE;

    // Rate-limit: be nice to their server
    if (pageNum < MAX_PAGES - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  log.info(`Fetch complete`, { pagesDownloaded: pages.length, totalOffset: offset });

  return { pages, fetchedCount: pages.length, errors };
}

/**
 * Fetch the detail page for a single event to get richer data.
 * @param {string} eventPath - e.g. "/en/view-events/2316/"
 * @returns {string|null}
 */
async function fetchDetailPage(eventPath, retries = 2) {
  const url = `https://sportsacademy.somaiya.edu${eventPath}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios({
        method: 'GET',
        url,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html',
        },
        timeout: REQUEST_TIMEOUT,
        responseType: 'text',
      });

      if (response.status === 200) return response.data;
    } catch (err) {
      log.debug(`Detail page fetch failed: ${eventPath}`, { error: err.message });
      if (attempt < retries) await sleep(RETRY_DELAY_MS);
    }
  }

  return null;
}

module.exports = { fetchAllPages, fetchPage, fetchDetailPage };
