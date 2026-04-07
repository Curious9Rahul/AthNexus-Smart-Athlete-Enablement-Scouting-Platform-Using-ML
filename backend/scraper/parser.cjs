/**
 * Parser — Extract structured event data from Somaiya HTML fragments.
 *
 * Uses Cheerio (server-side jQuery) to parse the HTML returned by
 * the events_ajax_new endpoint.
 */

const cheerio = require('cheerio');
const log = require('./logger.cjs');

const SOMAIYA_BASE = 'https://sportsacademy.somaiya.edu';

/**
 * Parse a single HTML page (fragment) into an array of raw event objects.
 * @param {string} html - HTML fragment from the AJAX endpoint
 * @returns {object[]} Array of raw event objects
 */
function parsePage(html) {
  if (!html || typeof html !== 'string') return [];

  const $ = cheerio.load(html);
  const events = [];

  // Each event card is a div.listingcard
  $('div.listingcard, .listingcard').each((_, el) => {
    try {
      const card = $(el);

      // ── Title + URL ─────────────────────────────────────
      const titleLink = card.find('.title a, a.darkf20firamd').first();
      const title = (titleLink.text() || '').trim();
      let href = (titleLink.attr('href') || '').trim();

      // Make URL absolute
      if (href && !href.startsWith('http')) {
        href = SOMAIYA_BASE + href;
      }

      // ── External ID from URL ────────────────────────────
      const idMatch = href.match(/\/view-events\/(\d+)\//);
      const external_id = idMatch ? idMatch[1] : null;

      // ── Date + Time ─────────────────────────────────────
      // The date is typically next to a calendar icon
      let dateText = '';
      card.find('.fa-calendar, .fa-calendar-o').each((_, icon) => {
        const parent = $(icon).closest('.icontext, .listingpointicon-col, .listpointersgrid-col');
        const text = parent.length ? parent.text().trim() : $(icon).parent().text().trim();
        if (text) dateText = text;
      });

      // Fallback: find text that looks like a date pattern
      if (!dateText) {
        card.find('.icontext, .listingpointicon-col').each((_, el2) => {
          const text = $(el2).text().trim();
          if (text.match(/\d{1,2}(st|nd|rd|th)\s+\w+\s+\d{4}/i)) {
            dateText = text;
            return false; // break
          }
        });
      }

      // ── Location ────────────────────────────────────────
      let locationText = '';
      card.find('.fa-map-marker, .fa-map-marker-alt').each((_, icon) => {
        const parent = $(icon).closest('.icontext, .listingpointicon-col, .listpointersgrid-col');
        const text = parent.length ? parent.text().trim() : $(icon).parent().text().trim();
        if (text) locationText = text;
      });

      // ── Event Type + Audience ───────────────────────────
      let eventType = '';
      let audienceType = '';
      let institution = '';

      card.find('.listpointersgrid-col, .listpointers').each((_, el2) => {
        const block = $(el2);
        const labels = block.find('p');

        labels.each((_, p) => {
          const pText = $(p).text().trim();

          if (pText.startsWith('Event Type')) {
            // The value is usually the next <p> or within same container
          } else if (!eventType && block.text().includes('Event Type')) {
            const allPs = block.find('p');
            allPs.each((idx, pp) => {
              const t = $(pp).text().trim();
              if (t === 'Event Type' || t.startsWith('Event Type')) return;
              if (t === 'Audience Type' || t.startsWith('Audience Type')) return;
              if (t === 'Institution' || t.startsWith('Institution')) return;
              if (!eventType && idx > 0) eventType = t;
            });
          }
        });
      });

      // More robust extraction: look for label/value pairs
      const allText = card.text();
      const etMatch = allText.match(/Event\s+Type\s*[:\n\r]*\s*([A-Za-z\s,&-]+?)(?=Audience|Institution|$)/i);
      if (etMatch) eventType = etMatch[1].trim();

      const atMatch = allText.match(/Audience\s+Type\s*[:\n\r]*\s*([A-Za-z\s,&-]+?)(?=Institution|Event\s+Type|$)/i);
      if (atMatch) audienceType = atMatch[1].trim();

      const instMatch = allText.match(/Institution\s*[:\n\r]*\s*([A-Za-z\s,&-]+?)(?=Event\s+Type|Audience|$)/i);
      if (instMatch) institution = instMatch[1].trim();

      // ── Image ───────────────────────────────────────────
      let imageUrl = '';
      const img = card.find('.listingcard-right img, img').first();
      if (img.length) {
        imageUrl = (img.attr('src') || img.attr('data-src') || '').trim();
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = SOMAIYA_BASE + imageUrl;
        }
      }

      // Only emit if we have a title
      if (title) {
        events.push({
          title,
          event_url: href || null,
          external_id,
          date_text: dateText,
          location: locationText,
          event_type: eventType,
          audience_type: audienceType,
          institute_department: institution || 'Somaiya Sports Academy',
          image_url: imageUrl,
          source_name: 'Somaiya Sports Academy',
          source_page: 'https://sportsacademy.somaiya.edu/en/events-and-updates/events/',
        });
      }
    } catch (err) {
      log.warn('Failed to parse a card element', { error: err.message });
    }
  });

  log.debug(`Parsed ${events.length} events from HTML page`);
  return events;
}

/**
 * Parse multiple HTML pages into a flat array of raw event objects.
 * @param {string[]} pages - Array of HTML strings
 * @returns {object[]}
 */
function parseAllPages(pages) {
  const allEvents = [];

  for (const page of pages) {
    const events = parsePage(page);
    allEvents.push(...events);
  }

  log.info(`Total parsed events: ${allEvents.length}`, { pageCount: pages.length });
  return allEvents;
}

module.exports = { parsePage, parseAllPages };
