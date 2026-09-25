import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserDAF } from '@/../tests/database/in-memory-users-daf';
import { InMemoryPasswordResetTokensDAF } from '@/../tests/database/in-memory-password-reset-tokens-daf';
import { ResetPasswordUseCase } from '@/use-cases/users/reset-password';
import { hashToken } from '@/utils/token-crypto';
import { InvalidOrExpiredTokenError } from '@/use-cases/errors/invalid-or-expired-token-error';
import { verifyPassword } from 'serverless-crypto-utils/password-hashing';

describe('Reset Password Use Case', () => {
  let usersDaf: InMemoryUserDAF;
  let tokensDaf: InMemoryPasswordResetTokensDAF;
  let sut: ResetPasswordUseCase;

  beforeEach(() => {
    usersDaf = new InMemoryUserDAF();
    tokensDaf = new InMemoryPasswordResetTokensDAF();
    sut = new ResetPasswordUseCase(usersDaf, tokensDaf);
  });

  it('should reset the password with a valid token and increment token_version', async () => {
    const user = await usersDaf.create({
      id: 'user-1',
      name: 'João Silva',
      email: 'joao@example.com',
      passwordHash: 'old-hash',
      role: 'admin',
      tokenVersion: 1,
    });

    const rawToken = 'my-secret-token-12345';
    const tokenHash = await hashToken(rawToken);

    await tokensDaf.create({
      id: 'token-1',
      userId: user.id,
      tokenHash,
      type: 'reset_password',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora no futuro
    });

    const result = await sut.execute({
      token: rawToken,
      newPassword: 'NovaSenhaSegura@123',
    });

    expect(result.success).toBe(true);

    const updatedUser = await usersDaf.findById(user.id);
    expect(updatedUser?.tokenVersion).toBe(2);

    const isMatch = await verifyPassword(
      'NovaSenhaSegura@123',
      updatedUser!.passwordHash,
    );
    expect(isMatch).toBe(true);

    const tokenInDb = tokensDaf.tokens[0];
    expect(tokenInDb.usedAt).not.toBeNull();
  });

  it('should reject an expired or nonexistent token', async () => {
    await expect(() =>
      sut.execute({
        token: 'invalid-token',
        newPassword: 'NovaSenhaSegura@123',
      }),
    ).rejects.toBeInstanceOf(InvalidOrExpiredTokenError);
  });
});
