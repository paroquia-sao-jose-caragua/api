-- Migration: 0017-add-appointment-commitments.sql
-- Description: Adds kind and title to appointments and makes service_id, requester_name, and requester_phone nullable for internal commitments.

CREATE TABLE appointments_new (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  agent_id VARCHAR(26) NOT NULL REFERENCES pastoral_agents(id) ON DELETE CASCADE,
  service_id VARCHAR(26) REFERENCES appointment_services(id) ON DELETE RESTRICT,
  community_id VARCHAR(26) REFERENCES communities(id) ON DELETE SET NULL,

  kind VARCHAR(20) NOT NULL DEFAULT 'appointment' CHECK (kind IN ('appointment', 'commitment')),
  title VARCHAR(255),

  requester_name VARCHAR(255),
  requester_phone VARCHAR(50),
  requester_email VARCHAR(255),
  requester_relationship VARCHAR(100),

  patient_name VARCHAR(255),
  patient_address TEXT,
  patient_conditions TEXT,

  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  access_token VARCHAR(64) UNIQUE NOT NULL,
  requester_notes TEXT,
  private_pastoral_notes TEXT,
  cancellation_reason TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

INSERT INTO appointments_new (
  id, agent_id, service_id, community_id,
  kind, title,
  requester_name, requester_phone, requester_email, requester_relationship,
  patient_name, patient_address, patient_conditions,
  appointment_date, start_time, end_time,
  status, access_token, requester_notes, private_pastoral_notes, cancellation_reason,
  created_at, updated_at
)
SELECT
  id, agent_id, service_id, community_id,
  'appointment', NULL,
  requester_name, requester_phone, requester_email, requester_relationship,
  patient_name, patient_address, patient_conditions,
  appointment_date, start_time, end_time,
  status, access_token, requester_notes, private_pastoral_notes, cancellation_reason,
  created_at, updated_at
FROM appointments;

DROP TABLE appointments;

ALTER TABLE appointments_new RENAME TO appointments;

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_access_token ON appointments(access_token);
CREATE INDEX IF NOT EXISTS idx_appointments_agent_date ON appointments(agent_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_kind ON appointments(kind);

INSERT INTO migrations (id, name, description, author)
VALUES (17, '0017-add-appointment-commitments', 'Adds kind and title to appointments and makes service_id, requester_name, and requester_phone nullable for internal commitments.', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;
