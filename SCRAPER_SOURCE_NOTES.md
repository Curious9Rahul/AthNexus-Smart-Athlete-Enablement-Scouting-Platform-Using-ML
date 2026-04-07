# Somaiya Sports Academy — Scraper Source Notes

## Source URL
`https://sportsacademy.somaiya.edu/en/events-and-updates/events/`

## Data Loading Strategy: **AJAX POST (HTML fragments)**

### Discovery
The events page initially renders ~10 events server-side. Additional events load via AJAX pagination.

### AJAX Endpoint
```
POST https://sportsacademy.somaiya.edu/sports/events_ajax_new/{offset}
Content-Type: application/x-www-form-urlencoded

Body: page_no={offset}&institute_check=34,34
```

### Pagination
- `offset` increments by 10: `0, 10, 20, 30...`
- Response is an HTML fragment (not JSON)
- Empty response = end of data
- Total events (as of analysis): ~64

### Available Filters (POST params)
| Parameter | Description | Example |
|-----------|-------------|---------|
| `page_no` | Offset (0-based, step=10) | `0`, `10`, `20` |
| `institute_check` | Institution ID filter | `34,34` |
| `keywords` | Text search | `"cricket"` |
| `event_type_check` | Event type filter | (varies) |
| `audience_type_check` | Audience filter | (varies) |
| `from_date` | Start date filter | `DD/MM/YYYY` |
| `to_date` | End date filter | `DD/MM/YYYY` |

### Response Format
HTML fragment containing `div.listingcard` elements.

## CSS Selectors

| Data | Selector | Notes |
|------|----------|-------|
| Card container | `div.listingcard` | One per event |
| Title | `.title a, a.darkf20firamd` | Text = title, href = event URL |
| External ID | From href: `/en/view-events/{id}/` | Regex extract |
| Date/Time | `.fa-calendar` parent `.icontext` | Format: `6th Nov 2025 10 : 53 AM` |
| Location | `.fa-map-marker` parent `.icontext` | e.g. "Vidyavihar - Mumbai" |
| Event Type | Text after "Event Type" label | e.g. "Sports" |
| Audience Type | Text after "Audience Type" label | e.g. "Students", "Staff" |
| Institution | Text after "Institution" label | e.g. "Somaiya Sports Academy" |
| Image | `.listingcard-right img` src | Poster/banner image |

## Detail Page
Individual events at: `https://sportsacademy.somaiya.edu/en/view-events/{id}/`
Contains richer description and separated date fields.

## Example Parsed Event
```json
{
  "title": "Somaiya Pickleball Toss 2026",
  "event_url": "https://sportsacademy.somaiya.edu/en/view-events/2316/",
  "external_id": "2316",
  "date_text": "16th Feb 2026 10:56 AM 17th Feb 2026 10:56 AM",
  "location": "Vidyavihar - Mumbai",
  "event_type": "Sports",
  "audience_type": "Staff",
  "institute_department": "Somaiya Sports Academy",
  "image_url": "https://sportsacademy.somaiya.edu/..."
}
```

## Extraction Strategy: **HTML Scraping (Cheerio)**
- ✅ Preferred: POST to AJAX endpoint returns clean HTML fragments
- ❌ Not needed: No JSON API available
- ❌ Not needed: No browser automation required (no JS-dependent rendering for data)

## Rate Limiting & Politeness
- 800ms delay between requests
- User-Agent: `AthNexus-Scraper/1.0`
- Max 3 retries with exponential backoff
- 15s request timeout
