# Paróquia São José Caraguatatuba API

API backend do sistema institucional da Paróquia São José de Caraguatatuba. O projeto foi desenvolvido com Cloudflare Workers, TypeScript e Hono, usando Cloudflare D1 para persistencia relacional e Cloudflare R2 para armazenamento de anexos/imagens.

A API atende o painel administrativo e o site público da paróquia, centralizando autenticação, cadastros, publicação de conteúdo, agenda, pastorais, comunidades e horários de missas.

## Sumário

- [Tecnologias](#tecnologias)
- [Manual de instalação](#manual-de-instalacao)
- [Execução local](#execucao-local)
- [Scripts disponíveis](#scripts-disponiveis)
- [Esquemas do banco de dados](#esquemas-do-banco-de-dados)
- [Organizacao do código](#organizacao-do-codigo)
- [Rotas e documentação da API](#rotas-e-documentacao-da-api)
- [Testes](#testes)
- [Deploy](#deploy)
- [Licença](#licenca)

## Tecnologias

- **Cloudflare Workers**: ambiente serverless para execução da API.
- **Hono**: framework HTTP usado para rotas e middlewares.
- **TypeScript**: linguagem principal do projeto.
- **Cloudflare D1**: banco SQLite gerenciado pela Cloudflare.
- **Cloudflare R2**: armazenamento de arquivos, como imagens e anexos.
- **Wrangler**: CLI para desenvolvimento, migrações, build e deploy dos Workers.
- **Vitest**: framework de testes automatizados.
- **Zod**: validação de entradas da API.

## Manual de instalação

### 1. Pre-requisitos

Instale previamente:

- Node.js em versao LTS.
- npm.
- Wrangler CLI, que também já esta nas dependências de desenvolvimento do projeto.

Opcionalmente, para usar o Wrangler globalmente:

```bash
npm install -g wrangler
```

### 2. Clonar o repositório

```bash
git clone https://github.com/paroquia-sao-jose-caragua/api
cd api
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Configurar Cloudflare

O arquivo de configuração do Worker e [wrangler.jsonc](./wrangler.jsonc). Ele define:

- Worker local: `api-dev`
- Ambiente de staging: `api-staging`
- Ambiente de producao: `api`
- Binding D1: `DB`
- Binding R2: `R2_BUCKET`
- Porta local: `3333`

Antes de publicar em outra conta Cloudflare, atualize no [wrangler.jsonc](./wrangler.jsonc):

- `account_id`
- IDs dos bancos D1 em `d1_databases`
- nomes dos buckets R2 em `r2_buckets`
- dominios e URLs dos ambientes em `vars`

### 5. Login na Cloudflare

```bash
npx wrangler login
```

### 6. Inicializar banco local

A migracao inicial esta em [migrations/0001-init-db.sql](./migrations/0001-init-db.sql). Para criar as tabelas localmente:

```bash
npm run db:init
```

## Execução local

Para iniciar a API em modo local:

```bash
npm run dev
```

Por padrao, o Worker fica disponível em:

```text
http://localhost:3333
```

Rotas úteis durante o desenvolvimento:

- `GET /health`: verifica se a API está respondendo.
- `GET /docs`: abre a documentação Swagger.
- `GET /docs/openapi.json`: retorna a especificação OpenAPI.

## Scripts disponiveis

Os scripts estao definidos em [package.json](./package.json):

| Script                   | Descricao                                         |
| ------------------------ | ------------------------------------------------- |
| `npm run dev`            | Inicia o Worker local com `wrangler dev --local`. |
| `npm run build`          | Executa o build do Worker com Wrangler.           |
| `npm run deploy`         | Publica o ambiente de produção.                   |
| `npm run deploy:staging` | Publica o ambiente de staging.                    |
| `npm run test`           | Executa os testes automatizados com Vitest.       |
| `npm run test:watch`     | Executa os testes em modo observação.             |
| `npm run lint`           | Executa ESLint com correção automática.           |
| `npm run format`         | Formata o cádigo com Prettier.                    |
| `npm run cf-typegen`     | Gera tipos dos bindings Cloudflare.               |
| `npm run db:init`        | Executa a migração inicial no D1 local.           |

## Esquemas do banco de dados

O esquema SQL principal esta em [migrations/0001-init-db.sql](./migrations/0001-init-db.sql). As tabelas criadas pela migracao inicial sao:

| Tabela                     | Finalidade                                                |
| -------------------------- | --------------------------------------------------------- |
| `users`                    | Usuários administrativos, credenciais e papéis de acesso. |
| `attachments`              | Metadados de arquivos enviados para o armazenamento R2.   |
| `communities`              | Comunidades, capelas e igreja matriz.                     |
| `clergy`                   | Clero: Papa, Bispo, Padre e Diácono.                      |
| `pastorals`                | Pastorais, responsáveis, contatos e status de atividade.  |
| `blog_categories`          | Categorias usadas nas publicações do blog.                |
| `blog_drafts`              | Rascunhos de novas publicações.                           |
| `blog_post_drafts`         | Rascunhos de edição de publicações já existentes.         |
| `blog_posts`               | Publicações efetivamente publicadas.                      |
| `blog_post_history`        | Historico de publicação, edição e despublicação.          |
| `mass_schedules`           | Regras recorrentes de horários de missa.                  |
| `mass_schedule_times`      | Horários vinculados a uma regra de missa.                 |
| `mass_schedule_exceptions` | Exceções de horários de missa por data.                   |
| `event_schedules`          | Eventos especéficos do calendário paroquial.              |
| `migrations`               | Controle de migrações aplicadas.                          |

As validações de entrada da API ficam em [src/schemas](./src/schemas), e os esquemas da documentação OpenAPI ficam em [src/docs/schemas](./src/docs/schemas).

## Organização do código

```text
src/
  @types/              Tipos globais dos bindings e variáveis do Worker
  dictionaries/        Mensagens e traduções
  docs/                Especificação OpenAPI, paths e schemas
  entities/            Entidades de doménio
  errors/              Erros técnicos compartilhados
  http/                Controllers, rotas, middlewares e utilitários HTTP
  schemas/             Validações Zod para entradas da API
  services/            Acesso a banco, logs e armazenamento de arquivos
  use-cases/           Regras de negécio da aplicação
tests/
  database/            Implementações em meméria para testes
  factories/           Fábricas de dados de teste
  use-cases/           Testes automatizados dos casos de uso
migrations/            Scripts SQL do banco D1
scripts/               Scripts auxiliares do projeto
```

Fluxo geral da aplicacao:

1. `src/index.ts` cria a aplicação Hono, registra middlewares e rotas.
2. Controllers em `src/http/controllers` recebem as requisições HTTP.
3. Schemas em `src/schemas` validam entradas.
4. Use cases em `src/use-cases` executam as regras de negécio.
5. Services em `src/services` fazem acesso ao D1, R2 e logs.

## Rotas e documentacao da API

A documentação interativa e gerada pela propria API:

- Local: `http://localhost:3333/docs`
- Produção: `https://api.paroquiasaojosecaragua.org.br/docs`

Principais grupos de rotas:

| Grupo                          | Finalidade                                        |
| ------------------------------ | ------------------------------------------------- |
| `/sessions` e `/token/refresh` | Autenticação e renovação de token.                |
| `/users`                       | Cadastro de usuarios administrativos.             |
| `/attachments`                 | Consulta e upload de imagens/anexos.              |
| `/communities`                 | Comunidades e horarios de missa por comunidade.   |
| `/pastorals`                   | Cadastro e manutenção das pastorais.              |
| `/clergy`                      | Cadastro e manutenção do clero.                   |
| `/blog/categories`             | Categorias do blog.                               |
| `/blog/drafts`                 | Rascunhos de novas publicações.                   |
| `/blog/post-drafts`            | Rascunhos de edicao de publicações.               |
| `/blog/posts`                  | Listagem e despublicação de posts.                |
| `/mass-schedules`              | Edicao, exclusao e exceções de horários de missa. |
| `/event-schedules`             | Eventos especificos do calendário.                |
| `/calendar`                    | Consulta consolidada do calendário.               |
| `/docs`                        | Swagger UI e OpenAPI JSON.                        |

Algumas rotas exigem token JWT e permissão de usuário. A autenticação e aplicada nos arquivos de rota por meio dos middlewares `verifyToken` e `verifyUserRole`.

## Testes

Para executar a suite de testes:

```bash
npm run test
```

Os testes cobrem principalmente os casos de uso em [tests/use-cases](./tests/use-cases), usando implementações em memoria dos serviçõs de banco em [tests/database](./tests/database).

## Deploy

Deploy para staging:

```bash
npm run deploy:staging
```

Deploy para produção:

```bash
npm run deploy
```

Antes do deploy, confirme se os recursos Cloudflare do ambiente escolhido existem e se os bindings em [wrangler.jsonc](./wrangler.jsonc) apontam para os IDs corretos.

## Licenca

Este projeto e distribuido sob a licença **GNU General Public License v3.0 (GPLv3)**.

Consulte o arquivo [LICENSE](./LICENSE) para o texto completo da licença.
