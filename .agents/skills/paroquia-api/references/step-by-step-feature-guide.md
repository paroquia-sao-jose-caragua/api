# Guia Passo a Passo: Criação e Manutenção de Funcionalidades

Roteiro completo para planejar, codificar, testar e registrar novos recursos na API da Paróquia São José.

---

## 1. Ciclo de Desenvolvimento de uma Nova Funcionalidade

Siga esta sequência recomendada para garantir que nenhuma camada ou validação seja omitida:

### Passo 1: Migração do Banco de Dados (se houver novas tabelas ou colunas)
1. Crie o arquivo SQL sequencial em `migrations/` (ex: `0009-nome-da-migracao.sql`).
2. Utilize chaves primárias `id VARCHAR(26) PRIMARY KEY NOT NULL` (padrão ULID).
3. Utilize `DATETIME DEFAULT CURRENT_TIMESTAMP` para datas de criação.
4. Crie índices para colunas com busca frequente ou unicidade (`slug`, `name`, `type`, etc.).
5. Aplique localmente:
   ```bash
   npx wrangler d1 execute parish-db-dev --local --file=./migrations/0009-nome-da-migracao.sql
   ```

### Passo 2: Entidade de Domínio (`src/entities/`)
1. Crie `src/entities/<feature>.ts`.
2. Exporte `export type <Entity> = { ... };` com propriedades em camelCase.
3. Se referenciar outras entidades (ex: `coverUrl`, `photos`), declare campos opcionais adequados.

### Passo 3: Interface DAF (`src/services/database/`)
1. Crie `src/services/database/<feature>-daf.ts`.
2. Exporte a interface com os métodos necessários (`findById`, `findBySlug`, `create`, `save`, `delete`, etc.).

### Passo 4: Implementação D1 DAF (`src/services/database/d1/`)
1. Crie `src/services/database/d1/d1-<feature>-daf.ts`.
2. Defina `<Feature>Row` correspondente às colunas em snake_case do SQLite.
3. Crie `mapRowTo<Entity>` com conversões apropriadas (`Boolean(row.is_active)`, strings de datas).
4. Declare `const SELECT_<FEATURE>_FIELDS = '...'` com colunas explícitas.
5. Implemente os métodos usando `this.d1.prepare(...).bind(...)`.

### Passo 5: Implementação em Memória para Testes (`tests/database/`)
1. Crie `tests/database/in-memory-<feature>-daf.ts`.
2. Implemente a mesma interface guardando entidades em um array em memória (`public items: <Entity>[] = []`).

### Passo 6: Erros de Domínio (`src/use-cases/errors/`)
1. Se a regra de negócio possuir cenários de falha específicos (ex: duplicidade de slug ou nome), crie uma classe de erro customizada estendendo `Error`.
2. Exemplo: `export class <Feature>AlreadyExistsError extends Error { ... }`.

### Passo 7: Casos de Uso (`src/use-cases/<feature>/`)
1. Crie arquivos individuais para cada ação (ex: `create-<feature>.ts`, `get-<feature>.ts`, `list-<features>.ts`, `edit-<feature>.ts`, `delete-<feature>.ts`).
2. Injetar DAFs via construtor.
3. Implementar o método `async execute(...)`.
4. Utilizar `ulid()` de `serverless-crypto-utils/id-generation` e `makeSlug()` de `../factories/make-slug` quando necessário.

### Passo 8: Testes Automatizados (`tests/use-cases/<feature>/`)
1. Crie os arquivos `.spec.ts` correspondentes.
2. No `beforeEach`, instancie os DAFs em memória e o caso de uso (`sut`).
3. Cubra cenários de sucesso e cenários de erro esperados (`rejects.toBeInstanceOf(...)`).
4. Execute e valide:
   ```bash
   npm test
   ```

### Passo 9: Fábricas de Casos de Uso (`src/use-cases/factories/<feature>/`)
1. Crie `make-<action>-<feature>-use-case.ts`.
2. Receba `c: DomainContext` e instancie a classe concreta `D1<Feature>DAF(c.env.DB)`.

### Passo 10: Schema de Validação (`src/schemas/`)
1. Crie `src/schemas/use-<feature>-schema.ts`.
2. Exporte a função recebendo `t: TranslatorFn`.
3. Garanta que todas as mensagens de validação venham de `t(...)`.
4. Se novas chaves forem necessárias, adicione-as em `src/dictionaries/pt-BR.json`.

### Passo 11: Controladores HTTP (`src/http/controllers/<feature>/`)
1. Crie um arquivo por ação (`create.ts`, `list.ts`, `get.ts`, `edit.ts`, `delete.ts`).
2. Utilize `getAppContext(c)` para extrair `{ t, inputs, user, queries, params }`.
3. Valide o payload com o schema Zod.
4. Chame a fábrica e execute o caso de uso.
5. Trate os erros conhecidos com status e mensagem do dicionário.

### Passo 12: Rotas (`src/http/controllers/<feature>/routes.ts`)
1. Crie `routes.ts` com `new Hono().basePath('/<feature>')`.
2. Configure rotas públicas e rotas protegidas com `verifyToken` e/ou `verifyUserRole`.
3. Exporte como `<feature>Routes`.

### Passo 13: Registro Central (`src/index.ts`)
1. Importe `<feature>Routes` em `src/index.ts`.
2. Registre: `app.route('/', <feature>Routes);`.

### Passo 14: Documentação OpenAPI (`src/docs/`)
1. Crie schemas em `src/docs/schemas/<feature>.ts`.
2. Crie paths em `src/docs/paths/<feature>.ts`.
3. Conecte no catálogo OpenAPI em `src/docs/locales/pt-br.ts`.

---

## 2. Checklist de Validação Final

Antes de finalizar qualquer alteração:

- [ ] `npm test`: Todos os testes relevantes passam.
- [ ] `npm run lint`: Sem erros de linter ou formatação.
- [ ] Dicionário `src/dictionaries/pt-BR.json`: Todas as novas chaves de erro/sucesso registradas.
- [ ] Tipos SQLite/D1: Campos booleanos e numéricos convertidos corretamente na camada DAF.
- [ ] Segurança: Rotas sensíveis protegidas por `verifyToken` ou `verifyUserRole`.
- [ ] Respostas HTTP: Status corretos (200 para leituras/edições, 201 para criações, 400 para regras inválidas, 404 para recursos não encontrados).
