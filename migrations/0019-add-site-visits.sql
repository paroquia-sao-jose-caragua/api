-- Migration 0019: Add site_visits table for lightweight, privacy-friendly unique visitor tracking

CREATE TABLE IF NOT EXISTS site_visits (
  id TEXT PRIMARY KEY,
  visit_date TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'desktop',
  entry_path TEXT NOT NULL DEFAULT '/',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(visit_date, visitor_hash)
);

CREATE INDEX IF NOT EXISTS idx_site_visits_date ON site_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_site_visits_date_device ON site_visits(visit_date, device_type);
