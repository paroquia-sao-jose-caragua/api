-- Migration: 0003-expand-communities-and-add-gallery.sql
-- Description: Adiciona novos campos à tabela communities e cria a tabela community_photos

ALTER TABLE communities ADD COLUMN hero_subtitle TEXT;
ALTER TABLE communities ADD COLUMN about_title VARCHAR(255);
ALTER TABLE communities ADD COLUMN about_description TEXT;
ALTER TABLE communities ADD COLUMN history_summary TEXT;
ALTER TABLE communities ADD COLUMN patron_name VARCHAR(255);
ALTER TABLE communities ADD COLUMN patron_description TEXT;
ALTER TABLE communities ADD COLUMN patron_photo_id VARCHAR(26) REFERENCES attachments(id) ON DELETE SET NULL;
ALTER TABLE communities ADD COLUMN phone VARCHAR(50);
ALTER TABLE communities ADD COLUMN email VARCHAR(255);
ALTER TABLE communities ADD COLUMN office_hours TEXT;

CREATE TABLE IF NOT EXISTS community_photos (
  id VARCHAR(26) PRIMARY KEY NOT NULL,
  community_id VARCHAR(26) NOT NULL,
  photo_id VARCHAR(26) NOT NULL,
  caption VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (photo_id) REFERENCES attachments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_community_photos_community_id ON community_photos(community_id);

-- Seeds / Migração dos dados textuais já existentes

UPDATE communities
SET
  hero_subtitle = 'Centro da nossa fé e casa de todos os filhos de Deus. Sob a proteção de São José, seguimos unidos na oração, na caridade e no serviço.',
  about_title = 'O coração da nossa paróquia',
  about_description = 'A Igreja Matriz São José é o coração da nossa paróquia e o centro da vida comunitária. Dedicada ao nosso padroeiro São José, esposo de Maria e modelo de fé, trabalho e obediência, somos chamados a viver o Evangelho com simplicidade, confiança e amor.' || char(10) || char(10) || 'Aqui, você encontra um lugar de acolhida, oração e encontro com Deus para toda a família.',
  history_summary = 'Sua trajetória começou como comunidade vinculada à Catedral Divino Espírito Santo e nas primeiras reuniões de oração em barracão no bairro. Com a dedicação dos moradores, diáconos e sacerdotes pioneiros, a estrutura física evoluiu até a construção do templo atual e sua instituição como matriz paroquial.',
  patron_name = 'São José',
  patron_description = 'Esposo de Maria e protetor da Igreja',
  phone = '(12) 3883-4888',
  email = 'contato@paroquiasaojosecaragua.org.br',
  office_hours = 'Segunda a Sexta: 08h às 12h e 13h às 17h' || char(10) || 'Sábado: 08h às 12h'
WHERE slug IN ('sao-jose', 'matriz-sao-jose');

UPDATE communities
SET
  hero_subtitle = 'Lugar de oração, devoção mariana e união comunitária na Praia das Palmeiras.',
  about_title = 'Uma família de fé no coração do bairro',
  about_description = 'A Capela Nossa Senhora do Rosário acolhe com carinho os moradores e visitantes da Praia das Palmeiras, cultivando o amor ao Santo Terço e a vivência fraterna dos ensinamentos de Cristo.' || char(10) || char(10) || 'Com celebrações e encontros marianos regulares, é uma casa de portas abertas para a oração familiar.',
  history_summary = 'A comunidade teve seu início em reuniões de oração promovidas nas residências dos primeiros moradores do bairro. Com a doação do terreno e o trabalho dedicado dos fiéis, foi construída a capela dedicada a Nossa Senhora do Rosário.',
  patron_name = 'Nossa Senhora do Rosário',
  patron_description = 'Rainha do Santo Rosário e protetora das famílias',
  phone = '(12) 3883-4888',
  email = 'contato@paroquiasaojosecaragua.org.br',
  office_hours = 'Atendimento via Secretaria Paroquial (Matriz)'
WHERE slug = 'nossa-senhora-do-rosario';

UPDATE communities
SET
  hero_subtitle = 'Comunidade viva, acolhedora e atuante no bairro Porto Novo.',
  about_title = 'Fraternidade e auxílio no Porto Novo',
  about_description = 'Dedicada a Santa Edwiges, a capela do Porto Novo é ponto de encontro e fraternidade, onde a fé se traduz em oração constante e auxílio aos necessitados.' || char(10) || char(10) || 'Um espaço abençoado que acolhe crianças, jovens e adultos em momentos de formação e espiritualidade.',
  history_summary = 'Surgiu da iniciativa dos moradores do bairro Porto Novo, que se reuniam inicialmente em residências e salas de aula de escolas locais. Graças ao esforço comunitário e eventos beneficentes, o terreno foi conquistado e a capela construída.',
  patron_name = 'Santa Edwiges',
  patron_description = 'Padroeira dos necessitados e protetora dos humildes',
  phone = '(12) 3883-4888',
  email = 'contato@paroquiasaojosecaragua.org.br',
  office_hours = 'Atendimento via Secretaria Paroquial (Matriz)'
WHERE slug = 'santa-edwiges';

UPDATE communities
SET
  hero_subtitle = 'Exemplo de fé, união e virtude no cotidiano familiar.',
  about_title = 'Espelho da Casa de Nazaré',
  about_description = 'A Capela Sagrada Família busca ser espelho da Casa de Nazaré na Praia das Palmeiras, promovendo o amor, o respeito e o cultivo da fé nas famílias.' || char(10) || char(10) || 'Espaço dedicado à espiritualidade familiar e à vivência fraterna na comunidade.',
  history_summary = 'Estabelecida para servir aos moradores da Praia das Palmeiras, a capela nasceu do desejo de fortalecer os laços familiares e vivenciar os ensinamentos do Evangelho no dia a dia.',
  patron_name = 'Sagrada Família',
  patron_description = 'Jesus, Maria e José — Modelo supremo de família',
  phone = '(12) 3883-4888',
  email = 'contato@paroquiasaojosecaragua.org.br',
  office_hours = 'Atendimento via Secretaria Paroquial (Matriz)'
WHERE slug = 'sagrada-familia';

UPDATE communities
SET
  hero_subtitle = 'Refúgio de fé e amor divino no Pontal de Santa Marina.',
  about_title = 'Amor incondicional e misericórdia',
  about_description = 'A Capela Sagrado Coração de Jesus acolhe os fiéis do Pontal de Santa Marina, celebrando a misericórdia e o amor incondicional de Nosso Senhor.' || char(10) || char(10) || 'Um lugar de oração contínua, adoração ao Santíssimo Sacramento e fraternidade.',
  history_summary = 'Iniciada com o apoio pastoral e ações comunitárias da paróquia, a capela tornou-se centro de referência espiritual e social no bairro Pontal de Santa Marina.',
  patron_name = 'Sagrado Coração de Jesus',
  patron_description = 'Fonte inesgotável de amor, salvação e paz',
  phone = '(12) 3883-4888',
  email = 'contato@paroquiasaojosecaragua.org.br',
  office_hours = 'Atendimento via Secretaria Paroquial (Matriz)'
WHERE slug IN ('sagrado-coracao-de-jesus', 'capela-sagrado-coracao-de-jesus');
