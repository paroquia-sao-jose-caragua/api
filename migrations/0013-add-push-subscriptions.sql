-- Migration: 0013-add-push-subscriptions.sql
-- Description: Creates push_subscriptions table for storing Web Push Notification device tokens.

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id VARCHAR(50) PRIMARY KEY NOT NULL,
  user_name VARCHAR(255),
  user_id VARCHAR(50),
  origin VARCHAR(50) NOT NULL DEFAULT 'site',
  device_info VARCHAR(255),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_origin ON push_subscriptions(origin);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

INSERT INTO migrations (id, name, description, author)
VALUES (13, '0013-add-push-subscriptions', 'Creates push_subscriptions table for storing Web Push Notification device tokens', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;
