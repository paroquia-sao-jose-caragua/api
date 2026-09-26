-- Migration: 0011-add-pastoral-appointments.sql
-- Description: Adds tables for pastoral agents, appointment services, availabilities, blocked dates, and appointments.

-- 1. Agentes pastorais que realizam atendimentos ou visitas (Independente de clergy)
CREATE TABLE IF NOT EXISTS pastoral_agents (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(50),                      -- Ex: "Pe.", "Diác.", "Ministro(a)", "Ir."
  acting_role VARCHAR(100) NOT NULL,      -- Flag/Atuação: "Pároco", "Diácono", "Ministro da Eucaristia (MESC)", "Pastoral da Saúde", etc.
  user_id VARCHAR(26) REFERENCES users(id) ON DELETE SET NULL,
  phone VARCHAR(50) NOT NULL,             -- Celular com WhatsApp para notificações
  email VARCHAR(255),
  community_id VARCHAR(26) REFERENCES communities(id) ON DELETE SET NULL,
  photo_id VARCHAR(26) REFERENCES attachments(id) ON DELETE SET NULL,
  accepts_appointments BOOLEAN NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_pastoral_agents_active ON pastoral_agents(active);
CREATE INDEX IF NOT EXISTS idx_pastoral_agents_community ON pastoral_agents(community_id);

-- 2. Tipos de Atendimento oferecidos
CREATE TABLE IF NOT EXISTS appointment_services (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  title VARCHAR(150) NOT NULL,         -- Ex: "Confissão", "Direção Espiritual", "Comunhão aos Enfermos"
  category VARCHAR(50) NOT NULL,      -- 'clergy_sacramental', 'home_visit', 'pastoral'
  description TEXT,
  default_duration_minutes INTEGER NOT NULL DEFAULT 30,
  requires_address BOOLEAN DEFAULT 0, -- Se for 1 (ex: visita a enfermo), exige endereço
  active BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointment_services_active ON appointment_services(active);

-- 3. Relação N:N entre Agente e Serviços que realiza
CREATE TABLE IF NOT EXISTS agent_services (
  agent_id VARCHAR(26) NOT NULL REFERENCES pastoral_agents(id) ON DELETE CASCADE,
  service_id VARCHAR(26) NOT NULL REFERENCES appointment_services(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, service_id)
);

-- 4. Grade semanal de disponibilidade
CREATE TABLE IF NOT EXISTS agent_availabilities (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  agent_id VARCHAR(26) NOT NULL REFERENCES pastoral_agents(id) ON DELETE CASCADE,
  community_id VARCHAR(26) REFERENCES communities(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL,       -- 0=Dom, 1=Seg, ..., 6=Sáb
  start_time TIME NOT NULL,            -- "14:00"
  end_time TIME NOT NULL,              -- "17:00"
  slot_duration_minutes INTEGER DEFAULT 30,
  active BOOLEAN NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_agent_availabilities_agent ON agent_availabilities(agent_id, day_of_week);

-- 5. Bloqueios de data (férias, retiros, reuniões, imprevistos)
CREATE TABLE IF NOT EXISTS agent_blocked_dates (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  agent_id VARCHAR(26) NOT NULL REFERENCES pastoral_agents(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  start_time TIME,                     -- NULL = dia inteiro bloqueado
  end_time TIME,
  reason VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_agent_blocked_dates_agent ON agent_blocked_dates(agent_id, blocked_date);

-- 6. Agendamentos dos Fiéis
CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  agent_id VARCHAR(26) NOT NULL REFERENCES pastoral_agents(id) ON DELETE CASCADE,
  service_id VARCHAR(26) NOT NULL REFERENCES appointment_services(id) ON DELETE RESTRICT,
  community_id VARCHAR(26) REFERENCES communities(id) ON DELETE SET NULL,
  
  -- Solicitante (fiel ou familiar)
  requester_name VARCHAR(255) NOT NULL,
  requester_phone VARCHAR(50) NOT NULL,
  requester_email VARCHAR(255),
  requester_relationship VARCHAR(100), -- Ex: "Filho(a)", "Próprio fiel"
  
  -- Caso seja visita a enfermo em domicílio
  patient_name VARCHAR(255),
  patient_address TEXT,
  patient_conditions TEXT,             -- JSON com flags: acamado, engole hóstia, lúcido
  
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  access_token VARCHAR(64) UNIQUE NOT NULL,      -- Token seguro para o fiel consultar e cancelar sem login
  requester_notes TEXT,
  private_pastoral_notes TEXT,         -- Anotações sigilosas do padre/ministro
  cancellation_reason TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_access_token ON appointments(access_token);
CREATE INDEX IF NOT EXISTS idx_appointments_agent_date ON appointments(agent_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

INSERT INTO migrations (id, name, description, author)
VALUES (11, '0011-add-pastoral-appointments', 'Adds pastoral agents, services, availabilities, blocked dates, and appointments tables.', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;
