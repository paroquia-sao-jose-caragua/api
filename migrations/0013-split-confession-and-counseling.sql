-- Migration: 0013-split-confession-and-counseling.sql
-- Description: Separates Confissão as its own dedicated sacramental appointment service, and adds generic Aconselhamento e Outros.

-- 1. Update the existing service 01SVC000000000000000000001 to be strictly "Confissão"
UPDATE appointment_services
SET 
  title = 'Confissão',
  category = 'clergy_sacramental',
  description = 'Sacramento da Penitência e Reconciliação com o sacerdote (absolvição dos pecados e aconselhamento sacramental).',
  default_duration_minutes = 20,
  requires_address = 0,
  active = 1
WHERE id = '01SVC000000000000000000001';

-- 4. Record migration
INSERT INTO migrations (id, name, description, author)
VALUES (13, '0013-split-confession-and-counseling', 'Separates Confissão as a distinct sacramental service and adds generic Aconselhamento e Outros.', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;
