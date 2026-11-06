-- Migration: 0016-add-canonical-precepts-and-remove-yearly-masses.sql
-- Description: Creates canonical_precepts table with standard Brazilian holy days of obligation, and removes yearly mass schedules.

CREATE TABLE IF NOT EXISTS canonical_precepts (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  title VARCHAR(255) NOT NULL,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  is_precept BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_canonical_precepts_date ON canonical_precepts(month, day);

-- Seed standard canonical holy days and local solemnity
INSERT INTO canonical_precepts (id, title, day, month, is_precept, description, active)
VALUES 
  ('01KPRECEPT0101SMARIA0000001', 'Santa Maria, Mãe de Deus', 1, 1, 1, 'Solenidade de Santa Maria, Mãe de Deus - Oitava do Natal e Dia Mundial da Paz.', 1),
  ('01KPRECEPT0319SJOSE00000002', 'São José, Esposo da Virgem Maria', 19, 3, 1, 'Solenidade do Padroeiro da Paróquia e da Cidade de Caraguatatuba.', 1),
  ('01KPRECEPT1012APAREC0000003', 'Nossa Senhora da Conceição Aparecida', 12, 10, 1, 'Solenidade da Padroeira do Brasil - Dia de Preceito Nacional.', 1),
  ('01KPRECEPT1225NATAL00000004', 'Natal de Nosso Senhor Jesus Cristo', 25, 12, 1, 'Solenidade do Nascimento de Jesus - Dia de Preceito.', 1)
ON CONFLICT(id) DO NOTHING;

-- Remove legacy yearly mass schedules
DELETE FROM mass_schedules WHERE recurrence_type = 'yearly';

INSERT INTO migrations (id, name, description, author)
VALUES (16, '0016-add-canonical-precepts-and-remove-yearly-masses', 'Creates canonical_precepts table and removes yearly mass schedules', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;

