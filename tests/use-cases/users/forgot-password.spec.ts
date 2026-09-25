import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserDAF } from '@/../tests/database/in-memory-users-daf';
import { InMemoryPasswordResetTokensDAF } from '@/../tests/database/in-memory-password-reset-tokens-daf';
import { ForgotPasswordUseCase } from '@/use-cases/users/forgot-password';
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

describe('Forgot Password Use Case', () => {
  let usersDaf: InMemoryUserDAF;
  let tokensDaf: InMemoryPasswordResetTokensDAF;
  let emailService: FakeEmailService;
  let sut: ForgotPasswordUseCase;

  beforeEach(() => {
    usersDaf = new InMemoryUserDAF();
    tokensDaf = new InMemoryPasswordResetTokensDAF();
    emailService = new FakeEmailService();
    sut = new ForgotPasswordUseCase(usersDaf, tokensDaf, emailService);
  });

  it('should generate a token and send an email when user exists', async () => {
    await usersDaf.create({
      id: 'user-1',
      name: 'João Silva',
      email: 'joao@example.com',
      passwordHash: 'hash',
      role: 'admin',
    });

    const result = await sut.execute({
      email: 'joao@example.com',
      panelBaseUrl: 'http://localhost:3000',
    });

    expect(result.success).toBe(true);
    expect(tokensDaf.tokens).toHaveLength(1);
    expect(tokensDaf.tokens[0].userId).toBe('user-1');
    expect(emailService.sentPasswordResets).toHaveLength(1);
    expect(emailService.sentPasswordResets[0].to).toBe('joao@example.com');
    expect(emailService.sentPasswordResets[0].resetUrl).toContain('http://localhost:3000/redefinir-senha?token=');
  });

  it('should not send email and not fail if user does not exist', async () => {
    const result = await sut.execute({
      email: 'naoexiste@example.com',
      panelBaseUrl: 'http://localhost:3000',
    });

    expect(result.success).toBe(true);
    expect(tokensDaf.tokens).toHaveLength(0);
    expect(emailService.sentPasswordResets).toHaveLength(0);
  });

  it('should not send email if user is suspended', async () => {
    await usersDaf.create({
      id: 'user-suspended',
      name: 'Suspenso',
      email: 'suspenso@example.com',
      passwordHash: 'hash',
      role: 'user',
      status: 'suspended',
    });

    const result = await sut.execute({
      email: 'suspenso@example.com',
      panelBaseUrl: 'http://localhost:3000',
    });

    expect(result.success).toBe(true);
    expect(tokensDaf.tokens).toHaveLength(0);
    expect(emailService.sentPasswordResets).toHaveLength(0);
  });
});
