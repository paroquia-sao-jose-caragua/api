-- Migration: 0018-add-notices.sql
-- Description: Create notices table for the parish notice board (Mural de Avisos)

CREATE TABLE IF NOT EXISTS notices (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary VARCHAR(500),
  description TEXT NOT NULL,
  variant VARCHAR(30) NOT NULL DEFAULT 'info' CHECK (variant IN ('alert', 'info', 'solemnity')),
  image_id VARCHAR(26),
  action_text VARCHAR(100),
  action_url VARCHAR(500),
  pinned BOOLEAN NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT 1,
  starts_at DATETIME,
  ends_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,

  FOREIGN KEY (image_id) REFERENCES attachments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_notices_active_pinned ON notices(active, pinned DESC, created_at DESC);

INSERT INTO migrations (id, name, description, author)
VALUES (18, '0018-add-notices', 'Create notices table for the parish notice board (Mural de Avisos)', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;
