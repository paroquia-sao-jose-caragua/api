import { D1UsersDAF } from '@/services/database/d1/d1-users-daf';
import { D1PasswordResetTokensDAF } from '@/services/database/d1/d1-password-reset-tokens-daf';
import { ResendEmailService } from '@/services/email/email-service';
import { ResendUserInviteUseCase } from '@/use-cases/users/resend-user-invite';

export function makeResendUserInviteUseCase(c: DomainContext) {
  const usersDaf = new D1UsersDAF(c.env.DB);
  const passwordResetTokensDaf = new D1PasswordResetTokensDAF(c.env.DB);
  const emailService = new ResendEmailService(
    c.env.RESEND_API_KEY,
    c.env.RESEND_FROM_EMAIL,
  );

  return new ResendUserInviteUseCase(
    usersDaf,
    passwordResetTokensDaf,
    emailService,
  );
}
