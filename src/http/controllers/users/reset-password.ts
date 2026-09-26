import { getAppContext } from '@/http/utils/getAppContext';
import { useResetPasswordSchema } from '@/schemas/use-reset-password-schema';
import { makeResetPasswordUseCase } from '@/use-cases/factories/users/make-reset-password-use-case';
import { InvalidOrExpiredTokenError } from '@/use-cases/errors/invalid-or-expired-token-error';

export const resetPassword: ControllerFn = async (c) => {
  const { inputs, t } = getAppContext(c);

  const validationSchema = useResetPasswordSchema(t);
  const { token, newPassword } = validationSchema.parse(inputs);

  try {
    const resetPasswordUseCase = makeResetPasswordUseCase(c);
    await resetPasswordUseCase.execute({ token, newPassword });

    return c.json({
      message: t('password-reset-success'),
    });
  } catch (err) {
    if (err instanceof InvalidOrExpiredTokenError) {
      return c.json({ message: t('invalid-or-expired-token') }, 400);
    }

    throw err;
  }
};
