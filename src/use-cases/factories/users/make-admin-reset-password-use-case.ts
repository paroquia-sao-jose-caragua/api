import { D1UsersDAF } from '@/services/database/d1/d1-users-daf';
import { D1PasswordResetTokensDAF } from '@/services/database/d1/d1-password-reset-tokens-daf';
import { ResendEmailService } from '@/services/email/email-service';
import { AdminResetPasswordUseCase } from '@/use-cases/users/admin-reset-password';

export function makeAdminResetPasswordUseCase(c: DomainContext) {
  const usersDaf = new D1UsersDAF(c.env.DB);
  const passwordResetTokensDaf = new D1PasswordResetTokensDAF(c.env.DB);
  const emailService = new ResendEmailService(
    c.env.RESEND_API_KEY,
    c.env.RESEND_FROM_EMAIL,
  );

  return new AdminResetPasswordUseCase(
    usersDaf,
    passwordResetTokensDaf,
    emailService,
  );
}
