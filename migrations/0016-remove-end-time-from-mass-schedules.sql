-- Migration: 0016-alter-tables-from-mass-schedules.sql
-- Description: Removes end_time column from mass_schedules table and removes yearly mass schedules

ALTER TABLE mass_schedules DROP COLUMN end_time;
DELETE FROM mass_schedules WHERE recurrence_type = 'yearly';

INSERT INTO migrations (id, name, description, author)
VALUES (16, '0016-alter-tables-from-mass-schedules', 'Removes end_time column from mass_schedules table and removes yearly mass schedules', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;

