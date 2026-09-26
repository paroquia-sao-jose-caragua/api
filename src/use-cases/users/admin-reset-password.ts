import type { UsersDAF } from '@/services/database/users-daf';
import type { PasswordResetTokensDAF } from '@/services/database/password-reset-tokens-daf';
import type { EmailService } from '@/services/email/email-service';
import { UserNotFoundError } from '../errors/user-not-found-error';
import { hashPassword } from 'serverless-crypto-utils/password-hashing';
import { generateSecureToken, hashToken } from '@/utils/token-crypto';
import { ulid } from 'serverless-crypto-utils/id-generation';

interface AdminResetPasswordUseCaseRequest {
  targetUserId: string;
  newPassword?: string;
  sendEmail?: boolean;
  panelBaseUrl?: string;
}

interface AdminResetPasswordUseCaseResponse {
  success: boolean;
  message?: string;
}

export class AdminResetPasswordUseCase {
  constructor(
    private usersDaf: UsersDAF,
    private passwordResetTokensDaf: PasswordResetTokensDAF,
    private emailService: EmailService,
  ) {}

  async execute({
    targetUserId,
    newPassword,
    sendEmail = true,
    panelBaseUrl = 'http://localhost:3000',
  }: AdminResetPasswordUseCaseRequest): Promise<AdminResetPasswordUseCaseResponse> {
    const user = await this.usersDaf.findById(targetUserId);

    if (!user) {
      throw new UserNotFoundError();
    }

    if (newPassword && newPassword.trim().length > 0) {
      const passwordHash = await hashPassword(newPassword);
      await this.usersDaf.updatePassword(user.id, passwordHash);
      await this.usersDaf.incrementTokenVersion(user.id);
      return { success: true, message: 'Password updated directly' };
    }

    if (sendEmail) {
      await this.passwordResetTokensDaf.invalidateUserTokens(user.id);

      const rawToken = generateSecureToken(32);
      const tokenHash = await hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      const tokenId = ulid();

      await this.passwordResetTokensDaf.create({
        id: tokenId,
        userId: user.id,
        tokenHash,
        type: 'reset_password',
        expiresAt,
      });

      const cleanBaseUrl = panelBaseUrl.replace(/\/+$/, '');
      const resetUrl = `${cleanBaseUrl}/redefinir-senha?token=${rawToken}`;

      await this.emailService.sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      });

      return { success: true, message: 'Reset email sent' };
    }

    return { success: true };
  }
}
