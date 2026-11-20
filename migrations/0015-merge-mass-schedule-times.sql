-- Migration: 0015-merge-mass-schedule-times.sql
-- Description: Merges mass_schedule_times directly into mass_schedules and drops mass_schedule_times table.

ALTER TABLE mass_schedules ADD COLUMN start_time TIME;
ALTER TABLE mass_schedules ADD COLUMN end_time TIME;

-- For schedules with multiple times, insert new schedule rows for the secondary times
INSERT INTO mass_schedules (
  id,
  community_id,
  title,
  type,
  orientations,
  is_precept,
  recurrence_type,
  day_of_week,
  day_of_month,
  week_of_month,
  month_of_year,
  active,
  start_date,
  end_date,
  created_at,
  updated_at,
  start_time,
  end_time
)
SELECT 
  mst.id,
  ms.community_id,
  ms.title,
  ms.type,
  ms.orientations,
  ms.is_precept,
  ms.recurrence_type,
  ms.day_of_week,
  ms.day_of_month,
  ms.week_of_month,
  ms.month_of_year,
  ms.active,
  ms.start_date,
  ms.end_date,
  ms.created_at,
  ms.updated_at,
  mst.start_time,
  mst.end_time
FROM mass_schedule_times mst
INNER JOIN mass_schedules ms ON ms.id = mst.schedule_id
WHERE mst.rowid NOT IN (
  SELECT MIN(rowid) FROM mass_schedule_times GROUP BY schedule_id
);

-- Update the primary schedule rows with their first time
UPDATE mass_schedules
SET start_time = (
  SELECT start_time FROM mass_schedule_times WHERE mass_schedule_times.schedule_id = mass_schedules.id LIMIT 1
),
end_time = (
  SELECT end_time FROM mass_schedule_times WHERE mass_schedule_times.schedule_id = mass_schedules.id LIMIT 1
)
WHERE start_time IS NULL;

DROP TABLE IF EXISTS mass_schedule_times;

CREATE INDEX IF NOT EXISTS idx_mass_schedules_start_time ON mass_schedules(start_time);

INSERT INTO migrations (id, name, description, author)
VALUES (15, '0015-merge-mass-schedule-times', 'Merges mass_schedule_times directly into mass_schedules and drops mass_schedule_times', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;

