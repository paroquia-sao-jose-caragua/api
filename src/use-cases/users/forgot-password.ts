import type { UsersDAF } from '@/services/database/users-daf';
import type { PasswordResetTokensDAF } from '@/services/database/password-reset-tokens-daf';
import type { EmailService } from '@/services/email/email-service';
import { generateSecureToken, hashToken } from '@/utils/token-crypto';
import { ulid } from 'serverless-crypto-utils/id-generation';

interface ForgotPasswordUseCaseRequest {
  email: string;
  panelBaseUrl: string;
}

interface ForgotPasswordUseCaseResponse {
  success: boolean;
}

export class ForgotPasswordUseCase {
  constructor(
    private usersDaf: UsersDAF,
    private passwordResetTokensDaf: PasswordResetTokensDAF,
    private emailService: EmailService,
  ) {}

  async execute({
    email,
    panelBaseUrl,
  }: ForgotPasswordUseCaseRequest): Promise<ForgotPasswordUseCaseResponse> {
    const user = await this.usersDaf.findByEmail(email);

    // Para evitar enumeração de usuários, retornamos sucesso mesmo se o e-mail não existir ou estiver suspenso
    if (!user || user.status === 'suspended') {
      return { success: true };
    }

    // Invalida tokens anteriores não usados
    await this.passwordResetTokensDaf.invalidateUserTokens(user.id);

    const rawToken = generateSecureToken(32);
    const tokenHash = await hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    const id = ulid();

    await this.passwordResetTokensDaf.create({
      id,
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

    return { success: true };
  }
}
