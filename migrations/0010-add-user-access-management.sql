-- Migration: 0010-add-user-access-management.sql
-- Description: Adds status, token_version, and last_login_at fields to users, and creates the password_reset_tokens table.

-- 1. Expandir a tabela users com campos de controle e revogação
ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending'));
ALTER TABLE users ADD COLUMN last_login_at DATETIME;
ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 1;

-- 2. Tabela para tokens de recuperação de senha e convites
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  user_id VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'reset_password' CHECK (type IN ('reset_password', 'invite')),
  expires_at DATETIME NOT NULL,
  used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);

INSERT INTO migrations (id, name, description, author)
VALUES (10, '0010-add-user-access-management', 'Adds status, token_version, and last_login_at fields to users, and creates the password_reset_tokens table.', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;