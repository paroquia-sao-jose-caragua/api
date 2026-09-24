-- Migration: 0008-add-urgent-alert.sql
-- Description: Cria tabela urgent_alerts para faixa de comunicado urgente e modal com arte

CREATE TABLE IF NOT EXISTS urgent_alerts (
  id VARCHAR(50) PRIMARY KEY NOT NULL,
  active BOOLEAN NOT NULL DEFAULT 0,
  text VARCHAR(255) NOT NULL,
  variant VARCHAR(30) NOT NULL DEFAULT 'alert' CHECK (variant IN ('alert', 'info', 'solemnity')),
  starts_at DATETIME,
  ends_at DATETIME,
  has_modal BOOLEAN NOT NULL DEFAULT 0,
  modal_button_text VARCHAR(50),
  modal_title VARCHAR(255),
  modal_description TEXT,
  modal_image_id VARCHAR(26),
  modal_action_text VARCHAR(100),
  modal_action_url VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (modal_image_id) REFERENCES attachments(id) ON DELETE SET NULL
);

INSERT INTO urgent_alerts (
  id,
  active,
  text,
  variant,
  has_modal,
  modal_button_text,
  modal_title,
  modal_description,
  modal_image_id,
  modal_action_text,
  modal_action_url,
  created_at
) VALUES (
  'primary',
  0,
  'Aviso Paroquial: Fique atento aos novos comunicados e celebrações da nossa comunidade.',
  'alert',
  0,
  'Ver Detalhes',
  'Comunicado Importante',
  'Acompanhe as atualizações da nossa paróquia.',
  NULL,
  NULL,
  NULL,
  CURRENT_TIMESTAMP
) ON CONFLICT(id) DO NOTHING;

INSERT INTO migrations (id, name, description, author)
VALUES (8, '0008-add-urgent-alert', 'Create urgent_alerts table for alert ticker bar and modal', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;
