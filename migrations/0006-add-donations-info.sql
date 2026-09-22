-- Migration: 0006-add-donations-info.sql
-- Description: Cria tabela donations_info para dados de PIX, dados bancários e contribuições da paróquia.

CREATE TABLE IF NOT EXISTS donations_info (
  id VARCHAR(50) PRIMARY KEY,
  pix_key VARCHAR(150),
  pix_key_type VARCHAR(50) DEFAULT 'phone',
  pix_receiver_name VARCHAR(150),
  pix_receiver_city VARCHAR(100),
  bank_name VARCHAR(100),
  bank_agency VARCHAR(50),
  bank_account VARCHAR(50),
  bank_account_type VARCHAR(50) DEFAULT 'Conta Corrente',
  bank_cnpj VARCHAR(50),
  bank_beneficiary VARCHAR(150),
  receipt_whatsapp VARCHAR(50),
  receipt_whatsapp_url VARCHAR(500),
  receipt_email VARCHAR(150),
  title VARCHAR(200),
  description TEXT,
  pastoral_center_title VARCHAR(200),
  pastoral_center_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

INSERT INTO donations_info (
  id,
  pix_key,
  pix_key_type,
  pix_receiver_name,
  pix_receiver_city,
  bank_name,
  bank_agency,
  bank_account,
  bank_account_type,
  bank_cnpj,
  bank_beneficiary,
  receipt_whatsapp,
  receipt_whatsapp_url,
  receipt_email,
  title,
  description,
  pastoral_center_title,
  pastoral_center_description,
  created_at
) VALUES (
  'primary',
  '(12) 98170-5757',
  'phone',
  'Paroquia Sao Jose',
  'Caraguatatuba',
  'Santander',
  '4171',
  '13002394-1',
  'Conta Corrente',
  '03.167.725/0017-24',
  'Diocese de Caraguatatuba - Paróquia São José',
  '(12) 98170-5757',
  'https://wa.me/5512981705757',
  'contato@paroquiasaojosecaragua.org.br',
  'Contribua com as obras e missões da Paróquia São José',
  'Cada contribuição é um ato de fé e solidariedade, fortalecendo a missão da paróquia e o trabalho pastoral em nossa comunidade.',
  'Centro Pastoral da Paróquia São José',
  'Com fé e dedicação, estamos dando vida ao Centro Pastoral da Paróquia São José — um espaço para evangelização, formação e convivência cristã. A boa fé de cada doador permitiu erguermos um local que acolhe a comunidade, promove encontros e fortalece a missão pastoral.',
  CURRENT_TIMESTAMP
)
ON CONFLICT(id) DO NOTHING;

INSERT INTO migrations (id, name, description, author)
VALUES (6, '0006-add-donations-info', 'Create donations_info table for pix, bank accounts, and donation data', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;
