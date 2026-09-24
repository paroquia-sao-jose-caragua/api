---
name: paroquia-api
description: >-
  Use this skill when developing, refactoring, extending, or maintaining the Paróquia São José backend API
  (built on Cloudflare Workers, Hono, Cloudflare D1 SQLite, Cloudflare R2, Zod, and Vitest).
  It enforces the project's Clean Architecture standards, DAF (Data Access Factory) patterns,
  controllers, use cases, in-memory test implementations, database migrations, and internationalization rules.
---

# Paróquia São José API — Development & Architecture Skill

Guia operacional para desenvolvimento, refatoração e manutenção da API da Paróquia São José de Caraguatatuba.

---

## 1. Visão Geral do Projeto

A API é uma aplicação serverless de alta performance projetada para execução no **Cloudflare Workers**, consumida pelo painel administrativo (`panel`) e pelo site público (`site`).

- **Framework Web**: [Hono](https://hono.dev/) (`app = new Hono<{ Bindings: Bindings; Variables: Variables }>({ strict: false })`).
- **Banco de Dados**: Cloudflare D1 (SQLite distribuído) com migrations em `migrations/*.sql`.
- **Armazenamento de Mídia**: Cloudflare R2 (bucket `parish-attachments-*`).
- **Segurança & IDs**: ULIDs de 26 caracteres gerados via `serverless-crypto-utils/id-generation` e autenticação JWT/HMAC-256 via `serverless-crypto-utils/access-token`.
- **Validação de Entrada**: Zod schemas com suporte a i18n (`src/schemas/`).
- **Testes**: Vitest cobrindo Use Cases com implementações de banco em memória (`tests/database/in-memory-*-daf.ts`).

---

## 2. Padrão Arquitetural: DAF & Clean Architecture

O projeto implementa uma separação rigorosa em camadas inspirada em Clean Architecture:

```text
HTTP Controller (Hono)
       │  (parseBody -> useSchema(t).parse(inputs))
       ▼
Use Case Factory (makeUseCase(c))
       │  (instancia D1DAF(c.env.DB) e injeta no UseCase)
       ▼
Use Case (regras de negócio puras, gera ULID/slug/datas)
       │  (consome apenas interfaces DAF)
       ▼
DAF - Data Access Factory (SQL com D1 prepared statements)
       │
Cloudflare D1 (SQLite)
```

### Regras Invioláveis do Padrão

1. **Use Cases nunca acessam HTTP ou D1 diretamente**: Eles dependem estritamente de interfaces DAF (ex: `CommunitiesDAF`, `AttachmentsDAF`).
2. **DAFs D1 mapeiam linhas explicitamente**: Sempre defina `<Feature>Row` com colunas SQLite (snake_case, booleans como 0/1) e uma função `mapRowTo<Entity>(row)` para converter para a entidade de domínio.
3. **Controladores são leves**: Extraem o contexto com `getAppContext(c)`, validam a entrada, delegam para o caso de uso via fábrica `make<Action>UseCase(c)` e tratam erros de domínio mapeando para status HTTP com mensagens do dicionário `t(...)`.
4. **Tradução e i18n obrigatória**: Nenhuma mensagem de erro ao usuário deve ser hardcoded em string literal. Utilize sempre `t('chave')` com chaves registradas em `src/dictionaries/pt-BR.json`.
5. **Testes Unitários sem mocks pesados**: Use Cases devem ser testados usando os DAFs em memória (`InMemory<Feature>DAF`) criados em `tests/database/`.

---

## 3. Estrutura do Workspace

```text
src/
├── @types/          # Tipos globais de Bindings, Variables e Context
├── dictionaries/    # Dicionários de tradução (pt-BR.json) e função t()
├── docs/            # Especificação OpenAPI 3.0 e Swagger UI
├── entities/        # Modelos puros de domínio (TypeScript types)
├── errors/          # Erros de infraestrutura (DatabaseError)
├── http/
│   ├── controllers/ # Controllers e rotas por recurso
│   ├── middlewares/ # corsSetup, parseBody, verifyToken, onAppError, etc.
│   └── utils/       # getAppContext.ts
├── schemas/         # Validações Zod (use<Feature>Schema(t))
├── services/
│   ├── dam/         # Digital Asset Management (R2 images)
│   ├── database/    # Interfaces DAF e implementações D1 (d1/)
│   └── log/         # Logger (console, Discord webhook)
└── use-cases/
    ├── errors/      # Erros de negócio (ResourceAlreadyExistsError, etc.)
    ├── factories/   # make<Action>UseCase(c)
    └── <feature>/   # Classes de casos de uso
tests/
├── database/        # In-memory DAFs para Vitest
├── factories/       # Fábricas de dados falsos (faker)
└── use-cases/       # Suítes de testes unitários (.spec.ts)
migrations/          # Migrações SQL para o Cloudflare D1
scripts/             # Scripts utilitários de migração e suporte
```

---

## 4. Documentos de Referência Detalhados

Consulte os guias especializados na pasta `references/` para implementar ou alterar código:

- **[Padrões de Arquitetura](./references/architecture-pattern.md)**: Explicação detalhada de cada camada, injeção de dependência e ciclo de vida de requisição.
- **[Guia Passo a Passo de Novas Features](./references/step-by-step-feature-guide.md)**: Checklist e passo a passo desde a migração SQL até rotas e documentação OpenAPI.
- **[Boilerplates e Templates de Código](./references/code-templates.md)**: Modelos prontos para copiar e adaptar (Entity, DAF, D1 DAF, InMemory DAF, Use Case, Factory, Controller, Route, Spec).

---

## 5. Comandos e Procedimentos Frequentes

### Execução Local
```bash
# Iniciar worker localmente na porta 3333
npm run dev

# Gerar tipos TypeScript dos bindings Cloudflare
npm run cf-typegen
```

### Banco de Dados Local (D1)
```bash
# Executar migração inicial no D1 local
npm run db:init

# Executar uma migração específica localmente
npx wrangler d1 execute parish-db-dev --local --file=./migrations/000X-nome.sql

# Consultar tabela localmente
npx wrangler d1 execute parish-db-dev --local --command="SELECT * FROM communities LIMIT 5;"
```

### Testes & Qualidade
```bash
# Executar todos os testes de casos de uso
npm test

# Executar testes em modo watch
npm run test:watch

# Executar linter com correção automática
npm run lint

# Formatar código com Prettier
npm run format
```

### Deploy
```bash
# Publicar em Staging
npm run deploy:staging

# Publicar em Produção
npm run deploy
```
