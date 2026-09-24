-- Migration: 0007-make-mass-schedule-end-time-optional.sql
-- Description: Torna a coluna end_time opcional (nullable) na tabela mass_schedule_times

CREATE TABLE IF NOT EXISTS mass_schedule_times_dg_tmp (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  schedule_id VARCHAR(26) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  FOREIGN KEY (schedule_id) REFERENCES mass_schedules(id) ON DELETE CASCADE
);

INSERT INTO mass_schedule_times_dg_tmp (id, schedule_id, start_time, end_time)
SELECT id, schedule_id, start_time, end_time FROM mass_schedule_times;

DROP TABLE mass_schedule_times;

ALTER TABLE mass_schedule_times_dg_tmp RENAME TO mass_schedule_times;

CREATE INDEX IF NOT EXISTS idx_mass_schedule_times_schedule ON mass_schedule_times(schedule_id);
CREATE INDEX IF NOT EXISTS idx_mass_schedule_times_start_time ON mass_schedule_times(start_time);
