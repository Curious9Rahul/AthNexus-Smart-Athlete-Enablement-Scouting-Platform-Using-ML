# AthNexus — Events Scraping Pipeline Architecture

## Stack Choice: Node.js / Express (existing)

**Rationale**: The backend already runs Node.js/Express with MongoDB (Mongoose).  
Adding the scraper within the same codebase avoids a polyglot setup, shares the DB connection layer, and keeps deployment simple.

## Folder Layout

```
backend/
├── config/
│   └── passport.js              # (existing) OAuth config
├── data/
│   └── events.json              # (existing) legacy file-based events
├── models/
│   ├── User.js                  # (existing)
│   ├── ScrapedEvent.js          # NEW — canonical scraped event schema
│   └── ScrapeRun.js             # NEW — scrape run history / metrics
├── routes/
│   ├── auth.js                  # (existing)
│   ├── ml.js                    # (existing)
│   └── scraped-events.js        # NEW — GET /api/scraped-events
├── scraper/
│   ├── index.cjs                # NEW — CLI entry: orchestrates scrape pipeline
│   ├── fetcher.cjs              # NEW — HTTP fetch + pagination from Somaiya
│   ├── parser.cjs               # NEW — HTML → structured objects
│   ├── normalizer.cjs           # NEW — date/text normalization + validation
│   ├── upserter.cjs             # NEW — idempotent DB upsert with metrics
│   └── logger.cjs               # NEW — structured JSON logger + alerting
├── server.cjs                   # (existing) main Express server — extended
└── package.json                 # (existing) — add cheerio, node-cron deps
```

## Data Flow

```
Scheduler (cron/GHA)
  → scraper/index.cjs
    → fetcher.cjs     — POST /sports/events_ajax_new/{offset} (paginated)
    → parser.cjs       — Cheerio: HTML fragments → raw event objects
    → normalizer.cjs   — ISO dates, text cleanup, field validation
    → upserter.cjs     — Mongoose upsert (dedup by external_id → event_url → hash)
  → ScrapeRun logged   — { fetched, inserted, updated, failed, runtime }
  → Events API serves from MongoDB
  → Frontend renders from API
```

## Dedup Strategy

Priority order:
1. `external_id` (extracted from Somaiya URL path, e.g. `/view-events/2316/` → `2316`)
2. `event_url` (full canonical URL)
3. `hash(title + start_date + source_name)` — fallback

## Source Analysis (Somaiya Events Page)

- **URL**: `https://sportsacademy.somaiya.edu/en/events-and-updates/events/`
- **Data loading**: AJAX POST to `/sports/events_ajax_new/{offset}`
- **Content type**: `application/x-www-form-urlencoded`
- **Payload**: `page_no=0&institute_check=34,34`
- **Response**: HTML fragment (not JSON)
- **Pagination**: offset increments by 10 (0, 10, 20, ...)
- **Total events**: ~64
- **Selectors**:
  - Container: `div.listingcard`
  - Title: `.title a.darkf20firamd`
  - Date: `.fa-calendar` parent `.icontext`
  - Location: `.fa-map-marker` parent `.icontext`
  - Event Type / Audience: `.listpointersgrid-col p`
  - Image: `.listingcard-right img`
  - External ID: extracted from href `/en/view-events/{id}/`
