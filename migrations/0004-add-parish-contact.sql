-- Migration: 0004-add-parish-contact.sql
-- Description: Cria tabela parish_contact para gerenciar contatos, atendimento e redes sociais da paróquia

CREATE TABLE IF NOT EXISTS parish_contact (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  office_hours TEXT,
  instagram_url VARCHAR(500),
  youtube_url VARCHAR(500),
  facebook_url VARCHAR(500),
  whatsapp_url VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

INSERT INTO parish_contact (
  id,
  phone,
  whatsapp,
  email,
  address,
  office_hours,
  instagram_url,
  youtube_url,
  facebook_url,
  whatsapp_url,
  created_at
) VALUES (
  'primary',
  '(12) 3883-4888',
  '(12) 98170-5757',
  'contato@paroquiasaojosecaragua.org.br',
  'R. Edson dos Santos, 30 — Morro do Algodão, Caraguatatuba - SP, 11671-180',
  'Terça a sexta-feira: 09h às 12h e 14h às 17h40' || char(10) || 'Sábado: 08h às 12h',
  'https://www.instagram.com/paroquiasaojosecaragua/',
  'https://www.youtube.com/@paroquiasaojosecaragua',
  'https://www.facebook.com/parsaojose/?locale=pt_BR',
  'https://wa.me/5512981705757',
  CURRENT_TIMESTAMP
) ON CONFLICT(id) DO NOTHING;

INSERT INTO migrations (id, name, description, author) 
VALUES (4, '0004-add-parish-contact', 'Create parish_contact table for global contact, office hours, and social media', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;
