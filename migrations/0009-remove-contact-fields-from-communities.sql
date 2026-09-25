-- Migration: 0009-remove-contact-fields-from-communities.sql
-- Description: Remove phone, email e office_hours da tabela communities (dados agora centralizados em parish_contact)

ALTER TABLE communities DROP COLUMN phone;
ALTER TABLE communities DROP COLUMN email;
ALTER TABLE communities DROP COLUMN office_hours;
