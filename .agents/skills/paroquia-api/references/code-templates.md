# Boilerplates e Templates de Código da API

Use estes templates como base para manter a fidelidade e consistência com o padrão da base de código.

---

## 1. Entidade de Domínio (`src/entities/<feature>.ts`)

```typescript
export type Item = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  orderIndex: number;
  coverId?: string;
  createdAt: string;
  updatedAt?: string;
};
```

---

## 2. Interface DAF (`src/services/database/<feature>-daf.ts`)

```typescript
import type { Item } from '@/entities/item';

export interface ItemsDAF {
  findById(id: string): Promise<Item | null>;
  findBySlug(slug: string): Promise<Item | null>;
  findByName(name: string): Promise<Item | null>;
  findAll(): Promise<Item[]>;
  create(data: Item): Promise<void>;
  save(item: Item): Promise<void>;
  delete(id: string): Promise<void>;
}
```

---

## 3. Implementação D1 DAF (`src/services/database/d1/d1-<feature>-daf.ts`)

```typescript
import type { ItemsDAF } from '../items-daf';
import type { Item } from '@/entities/item';

type ItemRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: number; // SQLite armazena booleanos como 0 ou 1
  order_index: number;
  cover_id: string | null;
  created_at: string;
  updated_at: string | null;
};

function mapRowToItem(row: ItemRow): Item {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    isActive: Boolean(row.is_active),
    orderIndex: row.order_index,
    coverId: row.cover_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  };
}

const SELECT_ITEMS_FIELDS = `
  id, name, slug, description, is_active, order_index,
  cover_id, created_at, updated_at
`;

export class D1ItemsDAF implements ItemsDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  async findById(id: string): Promise<Item | null> {
    const row = await this.d1
      .prepare(`SELECT ${SELECT_ITEMS_FIELDS} FROM items WHERE id = ?`)
      .bind(id)
      .first<ItemRow>();

    return row ? mapRowToItem(row) : null;
  }

  async findBySlug(slug: string): Promise<Item | null> {
    const row = await this.d1
      .prepare(`SELECT ${SELECT_ITEMS_FIELDS} FROM items WHERE slug = ?`)
      .bind(slug)
      .first<ItemRow>();

    return row ? mapRowToItem(row) : null;
  }

  async findByName(name: string): Promise<Item | null> {
    const row = await this.d1
      .prepare(`SELECT ${SELECT_ITEMS_FIELDS} FROM items WHERE name = ?`)
      .bind(name)
      .first<ItemRow>();

    return row ? mapRowToItem(row) : null;
  }

  async findAll(): Promise<Item[]> {
    const { results } = await this.d1
      .prepare(`SELECT ${SELECT_ITEMS_FIELDS} FROM items ORDER BY order_index ASC`)
      .all<ItemRow>();

    return results.map(mapRowToItem);
  }

  async create(data: Item): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO items (
          id, name, slug, description, is_active, order_index, cover_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        data.id,
        data.name,
        data.slug,
        data.description ?? null,
        data.isActive ? 1 : 0,
        data.orderIndex,
        data.coverId ?? null,
        data.createdAt,
      )
      .run();
  }

  async save(item: Item): Promise<void> {
    await this.d1
      .prepare(
        `UPDATE items SET
          name = ?, slug = ?, description = ?, is_active = ?,
          order_index = ?, cover_id = ?, updated_at = ?
         WHERE id = ?`,
      )
      .bind(
        item.name,
        item.slug,
        item.description ?? null,
        item.isActive ? 1 : 0,
        item.orderIndex,
        item.coverId ?? null,
        item.updatedAt ?? new Date().toISOString(),
        item.id,
      )
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.d1.prepare(`DELETE FROM items WHERE id = ?`).bind(id).run();
  }
}
```

---

## 4. DAF em Memória para Testes (`tests/database/in-memory-<feature>-daf.ts`)

```typescript
import type { Item } from '@/entities/item';
import type { ItemsDAF } from '@/services/database/items-daf';

export class InMemoryItemsDAF implements ItemsDAF {
  public items: Item[] = [];

  async findById(id: string): Promise<Item | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<Item | null> {
    return this.items.find((item) => item.slug === slug) ?? null;
  }

  async findByName(name: string): Promise<Item | null> {
    return this.items.find((item) => item.name === name) ?? null;
  }

  async findAll(): Promise<Item[]> {
    return this.items;
  }

  async create(data: Item): Promise<void> {
    this.items.push(data);
  }

  async save(item: Item): Promise<void> {
    const index = this.items.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      this.items[index] = item;
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
```

---

## 5. Schema Zod (`src/schemas/use-<feature>-schema.ts`)

```typescript
import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useItemSchema = (t: TranslatorFn) => {
  return z.object({
    name: z
      .string()
      .min(1, t('required-field'))
      .max(255, t('error-max-length', { max: 255 })),
    description: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
    orderIndex: z.number().int().min(0).default(0),
    coverId: z.string().max(26).optional().nullable(),
  });
};

export type ItemInput = z.infer<ReturnType<typeof useItemSchema>>;
```

---

## 6. Caso de Uso (`src/use-cases/<feature>/create-<feature>.ts`)

```typescript
import { ulid } from 'serverless-crypto-utils/id-generation';
import type { Item } from '@/entities/item';
import type { ItemsDAF } from '@/services/database/items-daf';
import { ResourceAlreadyExistsError } from '../errors/resource-already-exists-error';
import { makeSlug } from '../factories/make-slug';

interface CreateItemUseCaseRequest {
  name: string;
  description?: string | null;
  isActive?: boolean;
  orderIndex?: number;
  coverId?: string | null;
}

interface CreateItemUseCaseResponse {
  item: Item;
}

export class CreateItemUseCase {
  constructor(private itemsDaf: ItemsDAF) {}

  async execute({
    name,
    description,
    isActive = true,
    orderIndex = 0,
    coverId,
  }: CreateItemUseCaseRequest): Promise<CreateItemUseCaseResponse> {
    const itemWithSameName = await this.itemsDaf.findByName(name);

    if (itemWithSameName) {
      throw new ResourceAlreadyExistsError();
    }

    const item: Item = {
      id: ulid(),
      name,
      slug: makeSlug(name),
      description: description ?? undefined,
      isActive,
      orderIndex,
      coverId: coverId ?? undefined,
      createdAt: new Date().toISOString(),
    };

    await this.itemsDaf.create(item);

    return { item };
  }
}
```

---

## 7. Fábrica do Caso de Uso (`src/use-cases/factories/<feature>/make-create-<feature>-use-case.ts`)

```typescript
import { D1ItemsDAF } from '@/services/database/d1/d1-items-daf';
import { CreateItemUseCase } from '@/use-cases/items/create-item';

export function makeCreateItemUseCase(c: DomainContext) {
  const itemsDaf = new D1ItemsDAF(c.env.DB);
  return new CreateItemUseCase(itemsDaf);
}
```

---

## 8. Controlador HTTP (`src/http/controllers/<feature>/create.ts`)

```typescript
import { getAppContext } from '@/http/utils/getAppContext';
import { useItemSchema } from '@/schemas/use-item-schema';
import { ResourceAlreadyExistsError } from '@/use-cases/errors/resource-already-exists-error';
import { makeCreateItemUseCase } from '@/use-cases/factories/items/make-create-item-use-case';

export const createItem: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);

  const validationSchema = useItemSchema(t);
  const data = validationSchema.parse(inputs);

  try {
    const createUseCase = makeCreateItemUseCase(c);
    const { item } = await createUseCase.execute(data);

    return c.json({ item }, 201);
  } catch (err) {
    if (err instanceof ResourceAlreadyExistsError) {
      return c.json({ message: t('error-name-already-in-use') }, 400);
    }

    throw err;
  }
};
```

---

## 9. Arquivo de Rotas (`src/http/controllers/<feature>/routes.ts`)

```typescript
import { Hono } from 'hono';
import { verifyToken } from '@/http/middlewares/verifyToken';
import { createItem } from './create';
import { listItems } from './list';
import { getItemBySlug } from './get';
import { editItem } from './edit';
import { deleteItem } from './delete';

const app = new Hono().basePath('/items');

// Rotas Públicas
app.get('/', listItems);
app.get('/:slug', getItemBySlug);

// Rotas Protegidas (Painel Administrativo)
app.use(verifyToken);
app.post('/', createItem);
app.put('/:id', editItem);
app.delete('/:id', deleteItem);

export { app as itemsRoutes };
```

---

## 10. Teste de Caso de Uso com Vitest (`tests/use-cases/<feature>/create-<feature>.spec.ts`)

```typescript
import { describe, beforeEach, it, expect } from 'vitest';
import { InMemoryItemsDAF } from '../../database/in-memory-items-daf';
import { CreateItemUseCase } from '@/use-cases/items/create-item';
import { ResourceAlreadyExistsError } from '@/use-cases/errors/resource-already-exists-error';

let itemsDaf: InMemoryItemsDAF;
let sut: CreateItemUseCase;

describe('Create Item Use Case', () => {
  beforeEach(() => {
    itemsDaf = new InMemoryItemsDAF();
    sut = new CreateItemUseCase(itemsDaf);
  });

  it('should be able to create an item', async () => {
    const { item } = await sut.execute({
      name: 'Item de Teste',
      description: 'Descrição de teste',
    });

    expect(item.id).toBeDefined();
    expect(item.slug).toBe('item-de-teste');
    expect(itemsDaf.items).toHaveLength(1);
  });

  it('should not be able to create an item with same name twice', async () => {
    await sut.execute({
      name: 'Item Duplicado',
    });

    await expect(() =>
      sut.execute({
        name: 'Item Duplicado',
      }),
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError);
  });
});
```
