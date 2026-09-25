import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserDAF } from '@/../tests/database/in-memory-users-daf';
import { ChangePasswordUseCase } from '@/use-cases/users/change-password';
import { hashPassword, verifyPassword } from 'serverless-crypto-utils/password-hashing';
import { InvalidCurrentPasswordError } from '@/use-cases/errors/invalid-current-password-error';

describe('Change Password Use Case', () => {
  let usersDaf: InMemoryUserDAF;
  let sut: ChangePasswordUseCase;

  beforeEach(() => {
    usersDaf = new InMemoryUserDAF();
    sut = new ChangePasswordUseCase(usersDaf);
  });

  it('should change password when current password is correct', async () => {
    const passwordHash = await hashPassword('SenhaAtual@123');
    const user = await usersDaf.create({
      id: 'user-1',
      name: 'Maria Santos',
      email: 'maria@example.com',
      passwordHash,
      role: 'secretary',
      tokenVersion: 1,
    });

    const result = await sut.execute({
      userId: user.id,
      currentPassword: 'SenhaAtual@123',
      newPassword: 'NovaSenhaForte@456',
    });

    expect(result.success).toBe(true);

    const updatedUser = await usersDaf.findById(user.id);
    expect(updatedUser?.tokenVersion).toBe(2);

    const isMatch = await verifyPassword(
      'NovaSenhaForte@456',
      updatedUser!.passwordHash,
    );
    expect(isMatch).toBe(true);
  });

  it('should reject if current password does not match', async () => {
    const passwordHash = await hashPassword('SenhaCorreta@123');
    const user = await usersDaf.create({
      id: 'user-1',
      name: 'Maria Santos',
      email: 'maria@example.com',
      passwordHash,
      role: 'secretary',
    });

    await expect(() =>
      sut.execute({
        userId: user.id,
        currentPassword: 'SenhaErrada@123',
        newPassword: 'NovaSenhaForte@456',
      }),
    ).rejects.toBeInstanceOf(InvalidCurrentPasswordError);
  });
});
