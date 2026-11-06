-- Migration: 0018-drop-canonical-precepts.sql
-- Description: Drops canonical_precepts table as solemnities and feasts are managed directly through event schedules.

DROP TABLE IF EXISTS canonical_precepts;

INSERT INTO migrations (id, name, description, author)
VALUES (18, '0018-drop-canonical-precepts', 'Drops canonical_precepts table', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;

