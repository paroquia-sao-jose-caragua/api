# Arquitetura e Padrões de Projeto da API

Documento de referência detalhado sobre as camadas arquiteturais, responsabilidades e convenções da API Paróquia São José (Cloudflare Workers + Hono + D1 + R2).

---

## 1. Visão Geral da Pilha Tecnológica

- **Runtime**: Cloudflare Workers (`nodejs_compat`, serverless na edge).
- **Framework Web**: [Hono](https://hono.dev/) v4 (`strict: false`).
- **Linguagem**: TypeScript (ESNext, verbatimModuleSyntax, aliases `@/*` e `@tests/*`).
- **Banco de Dados Relacional**: Cloudflare D1 (SQLite distribuído) via binding `DB`.
- **Armazenamento de Arquivos**: Cloudflare R2 via binding `R2_BUCKET`.
- **Segurança & Criptografia**: `serverless-crypto-utils` (ULID, HMAC-256 tokens).
- **Validação**: Zod v4 integrado com dicionário de i18n (`TranslatorFn`).
- **Testes Automatizados**: Vitest com DAFs em memória (InMemoryDAF).
- **Documentação de API**: OpenAPI 3.0.3 + Swagger UI em `/docs`.

---

## 2. Camadas da Aplicação (Clean Architecture Adaptada)

```text
HTTP Request
     │
     ▼
[ src/index.ts ] ──► Middlewares Globais (CORS, withDictionary, parseBody)
     │
     ▼
[ src/http/controllers/<feature>/routes.ts ] ──► Middlewares de Rota (verifyToken, verifyUserRole)
     │
     ▼
[ src/http/controllers/<feature>/<action>.ts ]
     │  ├─ getAppContext(c) ──► extrai t, inputs, user, params, queries
     │  └─ use<Feature>Schema(t).parse(inputs) ──► Validação Zod
     │
     ▼
[ src/use-cases/factories/<feature>/make-<action>-use-case.ts ]
     │  └─ Instancia D1<Feature>DAF(c.env.DB) e injeta no UseCase
     │
     ▼
[ src/use-cases/<feature>/<action>-<feature>.ts ]
     │  ├─ Regras de negócio puras
     │  ├─ Geração de IDs (ulid()), slugs (makeSlug()) e datas (ISO string)
     │  └─ Comunicação exclusiva via Interfaces DAF (ex: CommunitiesDAF)
     │
     ▼
[ src/services/database/d1/d1-<feature>-daf.ts ]
     │  └─ Executa SQL preparado no Cloudflare D1 (this.d1.prepare(...))
     │
Cloudflare D1 (SQLite)
```

---

## 3. Detalhamento das Camadas

### 3.1. Entidades (`src/entities/`)
- Tipos puros TypeScript representando os modelos de domínio.
- Nomes em camelCase.
- Desacoplados de qualquer detalhe de banco (não expõem colunas SQL em snake_case).
- Datas representadas como strings ISO 8601 (`createdAt: string`, `updatedAt?: string`).
- Identificadores como strings ULID de 26 caracteres.

### 3.2. Data Access Factory / Facade (`src/services/database/`)
O projeto adota o padrão **DAF** para isolar o acesso a dados da regra de negócio:
- **Interface (`<feature>-daf.ts`)**: Define os métodos do repositório (`findById`, `findBySlug`, `create`, `save`, `delete`, etc.).
- **Implementação D1 (`d1/d1-<feature>-daf.ts`)**:
  - Define `type <Feature>Row` com nomes de colunas em `snake_case` e tipos SQLite (ex: `integer` para booleans).
  - Define constante `SELECT_<FEATURE>_FIELDS` contendo os nomes explícitos das colunas (evita `SELECT *`).
  - Função privada `mapRowTo<Entity>(row: <Feature>Row): <Entity>` responsável pelo casting correto (ex: `Boolean(row.is_active)`, fallback de campos nulos para `undefined`).
  - Utiliza `this.d1.prepare(sql).bind(...).first<Row>()` para buscas únicas e `.all<Row>()` para listas.
  - Utiliza `this.d1.batch([...])` quando múltiplas operações precisam ser executadas de forma coordenada.

### 3.3. Casos de Uso (`src/use-cases/`)
- Cada arquivo contém uma classe única responsável por uma única operação de negócio (ex: `CreateCommunityUseCase`).
- Recebe suas dependências (interfaces DAF, DAM, etc.) via construtor (Injeção de Dependências).
- Define contratos explícitos: `<Action>UseCaseRequest` e `<Action>UseCaseResponse`.
- Lança erros de domínio customizados localizados em `src/use-cases/errors/`.
- Não acessa bibliotecas HTTP (sem dependência de Hono, Response, Headers, etc.).

### 3.4. Fábricas de Casos de Uso (`src/use-cases/factories/`)
- Função `make<Action>UseCase(c: DomainContext)` responsável por:
  1. Instanciar as implementações concretas de D1 passando `c.env.DB`.
  2. Instanciar outros serviços necessários (ex: DAM R2, logger).
  3. Retornar a instância do UseCase pronto para execução.

### 3.5. Schemas de Validação (`src/schemas/`)
- Funções que recebem `t: TranslatorFn` e retornam um `z.object({...})`.
- Mensagens de erro sempre extraídas do dicionário i18n (`t('required-field')`, `t('error-max-length', { max: 255 })`).
- Validação de IDs com `.ulid(t('invalid-file-id'))` ou formato similar.

### 3.6. Controladores HTTP (`src/http/controllers/`)
- Funções com tipagem `ControllerFn`: `(c: DomainContext) => Promise<TypedResponse>`.
- Utilizam `getAppContext(c)` para extrair dependências de forma padronizada.
- Executam a validação do schema com `schema.parse(inputs)`.
- Instanciam o caso de uso via fábrica e chamam `.execute(...)`.
- Tratam erros de domínio esperados em blocos `try/catch`, retornando status HTTP adequado (400, 404, 401, 403) e mensagens internacionalizadas via `t(...)`.
- Erros não previstos são relançados com `throw err`, sendo tratados pelo `onAppError`.

### 3.7. Rotas (`src/http/controllers/<feature>/routes.ts`)
- Utilizam `const app = new Hono().basePath('/<recurso>');`.
- Rotas públicas declaradas antes de `app.use(verifyToken)`.
- Rotas protegidas declaradas após `app.use(verifyToken)` ou com middleware inline.
- Sub-recursos vinculados com `app.route('/:id', subFeatureRoutes)`.
- Exportadas como `<feature>Routes` e registradas no `src/index.ts` principal com `app.route('/', <feature>Routes)`.

### 3.8. Testes com DAFs em Memória (`tests/database/`)
- Cada DAF de produção possui um par `tests/database/in-memory-<feature>-daf.ts`.
- Mantém array privado `public items: <Entity>[] = []`.
- Implementa todos os métodos da interface de forma rápida e determinística.
- Permite que os testes unitários (`tests/use-cases/**/*.spec.ts`) executem em milissegundos sem mockar banco de dados ou depender de infraestrutura externa.
