-- Migration: 0014-add-device-id-to-push-subscriptions.sql
-- Description: Adds device_id to push_subscriptions table for unique device tracking and de-duplication.

ALTER TABLE push_subscriptions ADD COLUMN device_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_device_id ON push_subscriptions(device_id);

INSERT INTO migrations (id, name, description, author)
VALUES (14, '0014-add-device-id-to-push-subscriptions', 'Adds device_id to push_subscriptions table for device tracking', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;
