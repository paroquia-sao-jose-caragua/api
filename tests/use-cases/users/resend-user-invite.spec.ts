import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserDAF } from '@/../tests/database/in-memory-users-daf';
import { InMemoryPasswordResetTokensDAF } from '@/../tests/database/in-memory-password-reset-tokens-daf';
import { ResendUserInviteUseCase } from '@/use-cases/users/resend-user-invite';
import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error';
import { UserNotPendingError } from '@/use-cases/errors/user-not-pending-error';
import type { EmailService } from '@/services/email/email-service';

class FakeEmailService implements EmailService {
  public sentPasswordResets: { to: string; name: string; resetUrl: string }[] = [];
  public sentInvites: { to: string; name: string; inviteUrl: string; role: string }[] = [];

  async sendPasswordResetEmail(params: { to: string; name: string; resetUrl: string }) {
    this.sentPasswordResets.push(params);
  }

  async sendUserInviteEmail(params: { to: string; name: string; inviteUrl: string; role: string }) {
    this.sentInvites.push(params);
  }
}

describe('Resend User Invite Use Case', () => {
  let usersDaf: InMemoryUserDAF;
  let tokensDaf: InMemoryPasswordResetTokensDAF;
  let emailService: FakeEmailService;
  let sut: ResendUserInviteUseCase;

  beforeEach(() => {
    usersDaf = new InMemoryUserDAF();
    tokensDaf = new InMemoryPasswordResetTokensDAF();
    emailService = new FakeEmailService();
    sut = new ResendUserInviteUseCase(usersDaf, tokensDaf, emailService);
  });

  it('should resend invite email and create a new 48-hour token for a pending user', async () => {
    const user = await usersDaf.create({
      id: 'user-pending-1',
      name: 'Maria Silva',
      email: 'maria@example.com',
      passwordHash: 'dummy-hash',
      role: 'secretary',
      status: 'pending',
    });

    // Criar um token antigo para simular expiração ou token anterior
    await tokensDaf.create({
      id: 'old-token',
      userId: user.id,
      tokenHash: 'old-hash',
      type: 'invite',
      expiresAt: new Date(Date.now() - 1000),
    });

    const result = await sut.execute({
      targetUserId: user.id,
      panelBaseUrl: 'https://painel.paroquiasaojosecaragua.org.br',
    });

    expect(result.success).toBe(true);

    // Deve ter invalidado o token antigo e criado um novo
    expect(tokensDaf.tokens).toHaveLength(2);
    expect(tokensDaf.tokens[0].usedAt).not.toBeNull(); // Token antigo marcado como usado/invalidado

    const newToken = tokensDaf.tokens[1];
    expect(newToken.userId).toBe(user.id);
    expect(newToken.type).toBe('invite');
    expect(newToken.usedAt).toBeNull();
    // Validade aproximada de 48 horas no futuro
    expect(newToken.expiresAt.getTime()).toBeGreaterThan(Date.now() + 47 * 60 * 60 * 1000);

    // Deve ter enviado o e-mail de convite
    expect(emailService.sentInvites).toHaveLength(1);
    expect(emailService.sentInvites[0].to).toBe('maria@example.com');
    expect(emailService.sentInvites[0].name).toBe('Maria Silva');
    expect(emailService.sentInvites[0].role).toBe('secretary');
    expect(emailService.sentInvites[0].inviteUrl).toContain('https://painel.paroquiasaojosecaragua.org.br/redefinir-senha?token=');
  });

  it('should throw UserNotFoundError if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        targetUserId: 'non-existent-user',
        panelBaseUrl: 'http://localhost:3000',
      }),
    ).rejects.toBeInstanceOf(UserNotFoundError);

    expect(tokensDaf.tokens).toHaveLength(0);
    expect(emailService.sentInvites).toHaveLength(0);
  });

  it('should throw UserNotPendingError if user is active', async () => {
    const user = await usersDaf.create({
      id: 'user-active-1',
      name: 'Carlos Ativo',
      email: 'carlos@example.com',
      passwordHash: 'dummy-hash',
      role: 'admin',
      status: 'active',
    });

    await expect(() =>
      sut.execute({
        targetUserId: user.id,
        panelBaseUrl: 'http://localhost:3000',
      }),
    ).rejects.toBeInstanceOf(UserNotPendingError);

    expect(tokensDaf.tokens).toHaveLength(0);
    expect(emailService.sentInvites).toHaveLength(0);
  });

  it('should throw UserNotPendingError if user is suspended', async () => {
    const user = await usersDaf.create({
      id: 'user-suspended-1',
      name: 'Lucas Suspenso',
      email: 'lucas@example.com',
      passwordHash: 'dummy-hash',
      role: 'secretary',
      status: 'suspended',
    });

    await expect(() =>
      sut.execute({
        targetUserId: user.id,
        panelBaseUrl: 'http://localhost:3000',
      }),
    ).rejects.toBeInstanceOf(UserNotPendingError);

    expect(tokensDaf.tokens).toHaveLength(0);
    expect(emailService.sentInvites).toHaveLength(0);
  });
});
