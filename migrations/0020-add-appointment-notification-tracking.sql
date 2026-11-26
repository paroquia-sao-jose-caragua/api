-- Migration 0020: Add push notification tracking timestamps to appointments
-- Allows batching agent notifications (Tue-Fri 17:00 BRT, confirmed only)
-- and deferring secretariat notifications outside business hours.

ALTER TABLE appointments ADD COLUMN secretary_notified_at DATETIME;
ALTER TABLE appointments ADD COLUMN agent_notified_at DATETIME;

-- Backfill existing appointments as already notified to avoid spamming old records
UPDATE appointments
SET secretary_notified_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    agent_notified_at = COALESCE(created_at, CURRENT_TIMESTAMP);

CREATE INDEX IF NOT EXISTS idx_appointments_secretary_notified
  ON appointments(secretary_notified_at, status);

CREATE INDEX IF NOT EXISTS idx_appointments_agent_notified
  ON appointments(agent_notified_at, status);
