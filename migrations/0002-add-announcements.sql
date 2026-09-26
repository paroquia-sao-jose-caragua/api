CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  badge_text VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  action_text VARCHAR(100),
  action_url VARCHAR(500),
  
  -- Responsive Cover Images
  cover_desktop_id VARCHAR(26) NOT NULL,
  cover_tablet_id VARCHAR(26),
  cover_mobile_id VARCHAR(26),
  
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  starts_at DATETIME,
  ends_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,

  FOREIGN KEY (cover_desktop_id) REFERENCES attachments(id) ON DELETE RESTRICT,
  FOREIGN KEY (cover_tablet_id) REFERENCES attachments(id) ON DELETE SET NULL,
  FOREIGN KEY (cover_mobile_id) REFERENCES attachments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_announcements_active_sort ON announcements(active, sort_order ASC);

INSERT INTO migrations (id, name, description, author) 
VALUES (2, '0002-add-announcements', 'Create announcements table for home carousel banner with responsive attachments', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;
