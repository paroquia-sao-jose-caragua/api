-- Migration: 0017-remove-end-time-from-mass-schedules.sql
-- Description: Removes the end_time column from mass_schedules table since Catholic masses do not have fixed end times.

ALTER TABLE mass_schedules DROP COLUMN end_time;

INSERT INTO migrations (id, name, description, author)
VALUES (17, '0017-remove-end-time-from-mass-schedules', 'Removes end_time column from mass_schedules table', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;

