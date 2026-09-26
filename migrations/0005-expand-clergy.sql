-- Migration: 0005-expand-clergy.sql
-- Description: Adiciona colunas para suportar bio, short_intro, order_index, is_main e role_name na tabela clergy, e popula os clérigos iniciais.

ALTER TABLE clergy ADD COLUMN short_intro TEXT;
ALTER TABLE clergy ADD COLUMN bio TEXT;
ALTER TABLE clergy ADD COLUMN order_index INTEGER DEFAULT 0;
ALTER TABLE clergy ADD COLUMN is_main BOOLEAN DEFAULT 0;
ALTER TABLE clergy ADD COLUMN role_name VARCHAR(100);

INSERT INTO clergy (
  id,
  title,
  name,
  slug,
  position,
  role_name,
  short_intro,
  bio,
  order_index,
  is_main,
  created_at
) VALUES 
(
  '01KQN6F20Q35E0B6T175RJJ581',
  'Padre',
  'Padre Altair Santos',
  'padre-altair-santos',
  'parish_priest',
  'Pároco',
  'À frente da missão pastoral da nossa comunidade.',
  'Pe. Altair dos Santos nasceu em Florestópolis, no estado do Paraná, em 26 de janeiro de 1967. Filho de Sebastião dos Santos e Santa de Matos, foi batizado no Paraná. Recebeu os sacramentos da Primeira Eucaristia e da Crisma nas Paróquias de Nossa Senhora Auxiliadora e Nossa Senhora do Sagrado Coração, em Curitiba, onde iniciou seu engajamento pastoral. Foi ordenado diácono no Paraná e, posteriormente, ordenado presbítero em 29 de janeiro de 1994, em Curitiba (PR). Atualmente, exerce o ministério como pároco da Paróquia São José, em Caraguatatuba (SP), dedicando-se ao serviço pastoral da Igreja e da comunidade.',
  1,
  1,
  CURRENT_TIMESTAMP
),
(
  '01KQN6F20Q35E0B6T175RJJ582',
  'Diácono',
  'Valter de Almeida',
  'valter-de-almeida',
  'permanent_deacon',
  'Diácono Permanente',
  'Servindo ao altar e às obras de caridade da paróquia.',
  'Valter de Almeida nasceu em São José do Rio Pardo, no Estado de São Paulo, em 13 de abril de 1951, filho de José Porcínio de Almeida Sobrinho e Palmira Foiadelli de Almeida. É casado com Deiko Hashimoto de Almeida, com quem constituiu sua família, tendo um filho e dois netos. Foi ordenado Diácono Permanente em 05 de junho de 1999, na Catedral Divino Espírito Santo, em Caraguatatuba, pelas mãos de Dom Fernando Mason. Atualmente exerce seu ministério diaconal na Paróquia São José, no bairro Morro do Algodão, em Caraguatatuba, dedicando-se ao serviço da Igreja e da comunidade.',
  2,
  0,
  CURRENT_TIMESTAMP
),
(
  '01KQN6F20Q35E0B6T175RJJ583',
  'Dom',
  'Dom José Carlos Chacorowski',
  'dom-jose-carlos-chacorowski',
  'diocesan_bishop',
  'Bispo Diocesano',
  'Pastor da Diocese de Caraguatatuba.',
  'Dom José Carlos Chacorowski, CM, nasceu em Curitiba (PR) em 26 de dezembro de 1956. Ordenado sacerdote pelo Papa São João Paulo II em 1980, dedicou sua vida à formação, à missão evangelizadora e ao serviço pastoral, atuando no Brasil e em missão na República Democrática do Congo. Ao longo de sua trajetória, exerceu importantes funções na Congregação da Missão e junto às Filhas da Caridade, além de servir como Bispo Auxiliar de São Luís do Maranhão. Em 2013, foi nomeado pelo Papa Francisco Bispo da Diocese de Caraguatatuba, onde tomou posse em 17 de agosto do mesmo ano e segue conduzindo seu ministério episcopal até os dias atuais.',
  3,
  0,
  CURRENT_TIMESTAMP
),
(
  '01KQN6F20Q35E0B6T175RJJ584',
  'Papa',
  'Papa Leão XIV',
  'papa-leao-xiv',
  'supreme_pontiff',
  'Sumo Pontífice',
  'Bispo de Roma e pastor universal da Igreja Católica.',
  'O Papa Leão XIV, nascido Robert Francis Prevost em Chicago (EUA) em 1955, é o 267.º Papa da Igreja Católica. Membro da Ordem de Santo Agostinho, exerceu importante trabalho missionário e episcopal no Peru antes de assumir funções de destaque no Vaticano. Eleito em 8 de maio de 2025, escolheu o nome Leão XIV em referência ao Papa Leão XIII e à tradição da doutrina social da Igreja. Desde o início de seu pontificado, tem destacado a importância da paz, do diálogo, da justiça social e da unidade da Igreja.',
  4,
  0,
  CURRENT_TIMESTAMP
)
ON CONFLICT(id) DO NOTHING;

INSERT INTO migrations (id, name, description, author)
VALUES (5, '0005-expand-clergy', 'Add bio, short_intro, order_index, is_main and role_name to clergy', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;
