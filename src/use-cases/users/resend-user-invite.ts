import type { UsersDAF } from '@/services/database/users-daf';
import type { PasswordResetTokensDAF } from '@/services/database/password-reset-tokens-daf';
import type { EmailService } from '@/services/email/email-service';
import { UserNotFoundError } from '../errors/user-not-found-error';
import { UserNotPendingError } from '../errors/user-not-pending-error';
import { generateSecureToken, hashToken } from '@/utils/token-crypto';
import { ulid } from 'serverless-crypto-utils/id-generation';

interface ResendUserInviteUseCaseRequest {
  targetUserId: string;
  panelBaseUrl?: string;
}

interface ResendUserInviteUseCaseResponse {
  success: boolean;
  message?: string;
}

export class ResendUserInviteUseCase {
  constructor(
    private usersDaf: UsersDAF,
    private passwordResetTokensDaf: PasswordResetTokensDAF,
    private emailService: EmailService,
  ) {}

  async execute({
    targetUserId,
    panelBaseUrl = 'http://localhost:3000',
  }: ResendUserInviteUseCaseRequest): Promise<ResendUserInviteUseCaseResponse> {
    const user = await this.usersDaf.findById(targetUserId);

    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.status !== 'pending') {
      throw new UserNotPendingError();
    }

    // Invalida tokens anteriores não utilizados do usuário
    await this.passwordResetTokensDaf.invalidateUserTokens(user.id);

    // Gera um novo token seguro para convite com validade de 48 horas
    const rawToken = generateSecureToken(32);
    const tokenHash = await hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 horas
    const tokenId = ulid();

    await this.passwordResetTokensDaf.create({
      id: tokenId,
      userId: user.id,
      tokenHash,
      type: 'invite',
      expiresAt,
    });

    const cleanBaseUrl = panelBaseUrl.replace(/\/+$/, '');
    const inviteUrl = `${cleanBaseUrl}/redefinir-senha?token=${rawToken}`;

    await this.emailService.sendUserInviteEmail({
      to: user.email,
      name: user.name,
      inviteUrl,
      role: user.role,
    });

    return {
      success: true,
      message: 'Invite resent successfully',
    };
  }
}
