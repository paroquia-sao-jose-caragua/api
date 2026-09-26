import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserDAF } from '@/../tests/database/in-memory-users-daf';
import { UpdateUserRoleUseCase } from '@/use-cases/users/update-user-role';
import { LastAdminError } from '@/use-cases/errors/last-admin-error';

describe('Update User Role Use Case', () => {
  let usersDaf: InMemoryUserDAF;
  let sut: UpdateUserRoleUseCase;

  beforeEach(() => {
    usersDaf = new InMemoryUserDAF();
    sut = new UpdateUserRoleUseCase(usersDaf);
  });

  it('should update user role successfully', async () => {
    await usersDaf.create({
      id: 'admin-1',
      name: 'Admin 1',
      email: 'admin1@example.com',
      passwordHash: 'hash',
      role: 'admin',
      status: 'active',
    });

    await usersDaf.create({
      id: 'admin-2',
      name: 'Admin 2',
      email: 'admin2@example.com',
      passwordHash: 'hash',
      role: 'admin',
      status: 'active',
    });

    const result = await sut.execute({
      targetUserId: 'admin-2',
      newRole: 'secretary',
      currentAdminId: 'admin-1',
    });

    expect(result.user.role).toBe('secretary');
  });

  it('should not allow demoting the last active admin', async () => {
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
        newRole: 'viewer',
        currentAdminId: 'sole-admin',
      }),
    ).rejects.toBeInstanceOf(LastAdminError);
  });
});
