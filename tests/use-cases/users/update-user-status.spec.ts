import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserDAF } from '@/../tests/database/in-memory-users-daf';
import { UpdateUserStatusUseCase } from '@/use-cases/users/update-user-status';
import { LastAdminError } from '@/use-cases/errors/last-admin-error';

describe('Update User Status Use Case', () => {
  let usersDaf: InMemoryUserDAF;
  let sut: UpdateUserStatusUseCase;

  beforeEach(() => {
    usersDaf = new InMemoryUserDAF();
    sut = new UpdateUserStatusUseCase(usersDaf);
  });

  it('should suspend a user and increment token_version', async () => {
    const user = await usersDaf.create({
      id: 'user-1',
      name: 'João Voluntário',
      email: 'joao@example.com',
      passwordHash: 'hash',
      role: 'user',
      status: 'active',
      tokenVersion: 1,
    });

    const result = await sut.execute({
      targetUserId: user.id,
      newStatus: 'suspended',
      currentAdminId: 'admin-id',
    });

    expect(result.user.status).toBe('suspended');
    const updated = await usersDaf.findById(user.id);
    expect(updated?.tokenVersion).toBe(2);
  });

  it('should not allow suspending the last active admin', async () => {
    await usersDaf.create({
      id: 'sole-admin',
      name: 'Único Admin',
      email: 'admin@example.com',
      passwordHash: 'hash',
      role: 'admin',
      status: 'active',
    });

    await expect(() =>
      sut.execute({
        targetUserId: 'sole-admin',
        newStatus: 'suspended',
        currentAdminId: 'sole-admin',
      }),
    ).rejects.toBeInstanceOf(LastAdminError);
  });
});
