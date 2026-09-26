-- Migration: 0012-add-appointment-settings.sql
-- Description: Creates appointment_settings table for global enabling/disabling of the appointment system.

CREATE TABLE IF NOT EXISTS appointment_settings (
  id VARCHAR(50) PRIMARY KEY NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT 1,
  suspended_title VARCHAR(255) NOT NULL DEFAULT 'Agendamentos Temporariamente Suspensos',
  suspended_message TEXT NOT NULL DEFAULT 'Os agendamentos online estão temporariamente suspensos pela secretaria paroquial. Para urgências ou informações, entre em contato diretamente com a secretaria.',
  updated_at DATETIME
);

INSERT INTO appointment_settings (
  id,
  enabled,
  suspended_title,
  suspended_message,
  updated_at
) VALUES (
  'primary',
  1,
  'Agendamentos Temporariamente Suspensos',
  'Os agendamentos online estão temporariamente suspensos pela secretaria paroquial. Para urgências ou informações, entre em contato diretamente com a secretaria pelos canais de atendimento.',
  CURRENT_TIMESTAMP
) ON CONFLICT(id) DO NOTHING;

INSERT INTO migrations (id, name, description, author)
VALUES (12, '0012-add-appointment-settings', 'Creates appointment_settings table for global enabling/disabling of appointments', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;
