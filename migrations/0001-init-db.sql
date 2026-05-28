CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer', -- roles: admin, editor, viewer
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS attachments (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'attached', 'deleted')),
  storage_provider VARCHAR(50) NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  uploaded_by VARCHAR(36),

  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS communities (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('chapel', 'parish_church')),
  address TEXT NOT NULL,
  cover_id VARCHAR(26),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,

  FOREIGN KEY (cover_id) REFERENCES attachments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_communities_name ON communities(name);
CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);

CREATE TABLE IF NOT EXISTS clergy (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  title VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  position VARCHAR(50) NOT NULL CHECK (position IN ('supreme_pontiff', 'diocesan_bishop', 'parish_priest', 'permanent_deacon')),
  photo_id VARCHAR(26),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,

  FOREIGN KEY (photo_id) REFERENCES attachments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pastorals (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  responsible_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  cover_id VARCHAR(26),
  active BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,

  FOREIGN KEY (cover_id) REFERENCES attachments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pastorals_name ON pastorals(name);
CREATE INDEX IF NOT EXISTS idx_pastorals_slug ON pastorals(slug);

CREATE TABLE IF NOT EXISTS blog_categories (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_blog_categories_name ON blog_categories(name);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);

CREATE TABLE IF NOT EXISTS blog_drafts (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  event_date DATETIME,
  scheduled_publish_at DATETIME,
  scheduled_unpublish_at DATETIME,
  cover_id VARCHAR(26),
  category_id VARCHAR(26) NOT NULL,
  author_id VARCHAR(26)  NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,

  FOREIGN KEY (cover_id) REFERENCES attachments(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_blog_drafts_slug ON blog_drafts(slug);

CREATE TABLE IF NOT EXISTS blog_post_drafts (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  post_id VARCHAR(26) NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  event_date DATETIME,
  scheduled_publish_at DATETIME,
  scheduled_unpublish_at DATETIME,
  cover_id VARCHAR(26),
  last_auto_save_at DATETIME,
  author_id VARCHAR(26) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,

  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (cover_id) REFERENCES attachments(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_blog_post_drafts_post_id ON blog_post_drafts(post_id);

CREATE TABLE IF NOT EXISTS blog_posts (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  event_date DATETIME,
  published_at DATETIME  NOT NULL,
  unpublished_at DATETIME,
  scheduled_unpublish_at DATETIME,
  cover_id VARCHAR(26),
  category_id VARCHAR(26) NOT NULL,
  author_id VARCHAR(26)  NOT NULL,
  draft_id VARCHAR(26),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,

  FOREIGN KEY (cover_id) REFERENCES attachments(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (draft_id) REFERENCES blog_post_drafts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_published ON blog_posts(category_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_events ON blog_posts(category_id, event_date) WHERE event_date IS NOT NULL;

CREATE TABLE IF NOT EXISTS blog_post_history (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  post_id VARCHAR(26) NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('published', 'unpublished', 'edited')),
  user_id VARCHAR(26) NOT NULL,
  changes_summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_blog_post_history_post ON blog_post_history(post_id);

CREATE TABLE IF NOT EXISTS mass_schedules (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  community_id VARCHAR(26) NOT NULL,
  
  -- ✅ Identificação da missa
  title VARCHAR(255), -- "Missa Dominical", "Sagrado Coração", "São José"
  type VARCHAR(50) NOT NULL, -- 'regular', 'devotional', 'precept'
  orientations TEXT,
  is_precept BOOLEAN NOT NULL DEFAULT false,
  
  -- ✅ Configuração de recorrência
  recurrence_type VARCHAR(20) NOT NULL CHECK (recurrence_type IN ('weekly', 'monthly', 'yearly')),
  
  -- ✅ Para recorrência semanal
  day_of_week INTEGER, -- 0=domingo, 1=segunda, ..., 6=sábado (ISO)
  
  -- ✅ Para recorrência mensal
  day_of_month INTEGER, -- 1-31 para dia específico do mês
  week_of_month INTEGER, -- 1-5 para "1ª semana", "2ª semana", etc. (usado com day_of_week)
  month_of_year INTEGER, -- 1-12 para recorrência anual em mês específico (usado com day_of_month ou week_of_month + day_of_week)
  
  active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL, -- Quando começou a vigorar
  end_date DATE, -- NULL = indefinidamente
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mass_schedule_times (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  schedule_id VARCHAR(26) NOT NULL,
  start_time TIME NOT NULL, -- "09:00", "19:30"
  end_time TIME NOT NULL,
  
  FOREIGN KEY (schedule_id) REFERENCES mass_schedules(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mass_schedules_community ON mass_schedules(community_id);
CREATE INDEX IF NOT EXISTS idx_mass_schedules_recurrence ON mass_schedules(recurrence_type, active);
CREATE INDEX IF NOT EXISTS idx_mass_schedules_day_week ON mass_schedules(day_of_week) WHERE day_of_week IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mass_schedules_day_month ON mass_schedules(day_of_month) WHERE day_of_month IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mass_schedule_times_schedule ON mass_schedule_times(schedule_id);
CREATE INDEX IF NOT EXISTS idx_mass_schedule_times_start_time ON mass_schedule_times(start_time);

CREATE TABLE IF NOT EXISTS mass_schedule_exceptions (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  schedule_id VARCHAR(26) NOT NULL,
  exception_date DATE NOT NULL,
  start_time TIME NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_by VARCHAR(26) NOT NULL, 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (schedule_id) REFERENCES mass_schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  
  UNIQUE(schedule_id, exception_date, start_time)
);

CREATE INDEX IF NOT EXISTS idx_mass_exceptions_date ON mass_schedule_exceptions(exception_date);


CREATE TABLE IF NOT EXISTS event_schedules (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  community_id VARCHAR(26) NOT NULL,
  title VARCHAR(255),
  type VARCHAR(50) NOT NULL,
  mass_type VARCHAR(50) DEFAULT NULL,
  is_precept BOOLEAN DEFAULT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  custom_location VARCHAR(255),
  orientations TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_schedules_community ON event_schedules(community_id);
CREATE INDEX IF NOT EXISTS idx_event_schedules_date ON event_schedules(event_date);
CREATE INDEX IF NOT EXISTS idx_event_schedules_datetime ON event_schedules(event_date, start_time);

CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO migrations (id, name, description, author) 
VALUES (1, '0001-init-db', 'Run initial migration to create users and migrations tables', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;