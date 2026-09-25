import { D1UsersDAF } from '@/services/database/d1/d1-users-daf';
import { D1PasswordResetTokensDAF } from '@/services/database/d1/d1-password-reset-tokens-daf';
import { ResetPasswordUseCase } from '@/use-cases/users/reset-password';

export function makeResetPasswordUseCase(c: DomainContext) {
  const usersDaf = new D1UsersDAF(c.env.DB);
  const passwordResetTokensDaf = new D1PasswordResetTokensDAF(c.env.DB);

  return new ResetPasswordUseCase(usersDaf, passwordResetTokensDaf);
}
