import type { UsersDAF } from '@/services/database/users-daf';
import type { PasswordResetTokensDAF } from '@/services/database/password-reset-tokens-daf';
import { hashToken } from '@/utils/token-crypto';
import { hashPassword } from 'serverless-crypto-utils/password-hashing';
import { InvalidOrExpiredTokenError } from '../errors/invalid-or-expired-token-error';

interface ResetPasswordUseCaseRequest {
  token: string;
  newPassword: string;
}

interface ResetPasswordUseCaseResponse {
  success: boolean;
}

export class ResetPasswordUseCase {
  constructor(
    private usersDaf: UsersDAF,
    private passwordResetTokensDaf: PasswordResetTokensDAF,
  ) {}

  async execute({
    token,
    newPassword,
  }: ResetPasswordUseCaseRequest): Promise<ResetPasswordUseCaseResponse> {
    const tokenHash = await hashToken(token);
    const resetToken = await this.passwordResetTokensDaf.findValidToken(tokenHash);

    if (!resetToken) {
      throw new InvalidOrExpiredTokenError();
    }

    const user = await this.usersDaf.findById(resetToken.userId);

    if (!user || user.status === 'suspended') {
      throw new InvalidOrExpiredTokenError();
    }

    const newPasswordHash = await hashPassword(newPassword);

    await this.usersDaf.updatePassword(user.id, newPasswordHash);

    // Se o usuário estava pendente (ex: convite), ativa a conta automaticamente
    if (user.status === 'pending') {
      await this.usersDaf.updateStatus(user.id, 'active');
    }

    // Invalida sessões ativas existentes em outros dispositivos
    await this.usersDaf.incrementTokenVersion(user.id);

    // Marca o token como utilizado
    await this.passwordResetTokensDaf.markAsUsed(resetToken.id);

    return { success: true };
  }
}
