-- Migration 0021: Add visit_count/last_visit_at to site_visits and create site_page_views
-- Tracks unique visitors, total sessions/accesses, and per-page views without row bloat.

ALTER TABLE site_visits ADD COLUMN visit_count INTEGER NOT NULL DEFAULT 1;
ALTER TABLE site_visits ADD COLUMN last_visit_at TEXT;

UPDATE site_visits
SET last_visit_at = created_at
WHERE last_visit_at IS NULL;

CREATE TABLE IF NOT EXISTS site_page_views (
  visit_date TEXT NOT NULL,
  path TEXT NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (visit_date, path)
);

CREATE INDEX IF NOT EXISTS idx_site_page_views_date
  ON site_page_views(visit_date);

-- Backfill existing entry paths into site_page_views
INSERT OR IGNORE INTO site_page_views (visit_date, path, view_count)
SELECT visit_date, entry_path, SUM(visit_count)
FROM site_visits
GROUP BY visit_date, entry_path;
