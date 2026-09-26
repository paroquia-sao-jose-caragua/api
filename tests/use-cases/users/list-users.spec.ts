import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserDAF } from '@/../tests/database/in-memory-users-daf';
import { ListUsersUseCase } from '@/use-cases/users/list-users';

describe('List Users Use Case', () => {
  let usersDaf: InMemoryUserDAF;
  let sut: ListUsersUseCase;

  beforeEach(() => {
    usersDaf = new InMemoryUserDAF();
    sut = new ListUsersUseCase(usersDaf);
  });

  it('should list users with pagination and search filter', async () => {
    await usersDaf.create({
      id: 'user-1',
      name: 'Padre Carlos',
      email: 'padre@example.com',
      passwordHash: 'hash',
      role: 'admin',
    });

    await usersDaf.create({
      id: 'user-2',
      name: 'Secretária Ana',
      email: 'ana@example.com',
      passwordHash: 'hash',
      role: 'secretary',
    });

    const resultAll = await sut.execute({ page: 1, pageSize: 10 });
    expect(resultAll.total).toBe(2);
    expect(resultAll.users).toHaveLength(2);

    const resultSearch = await sut.execute({
      page: 1,
      pageSize: 10,
      search: 'Padre',
    });
    expect(resultSearch.total).toBe(1);
    expect(resultSearch.users[0].name).toBe('Padre Carlos');
  });
});
