import { getAppContext } from '@/http/utils/getAppContext';
import { useAdminResetPasswordSchema } from '@/schemas/use-admin-reset-password-schema';
import { makeAdminResetPasswordUseCase } from '@/use-cases/factories/users/make-admin-reset-password-use-case';
import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error';

export const adminResetPassword: ControllerFn = async (c) => {
  const { inputs, t } = getAppContext(c);
  const targetUserId = c.req.param('id');

  const validationSchema = useAdminResetPasswordSchema(t);
  const { password, sendEmail } = validationSchema.parse(inputs);

  try {
    const adminResetPasswordUseCase = makeAdminResetPasswordUseCase(c);
    const result = await adminResetPasswordUseCase.execute({
      targetUserId,
      newPassword: password,
      sendEmail,
      panelBaseUrl: c.env.PANEL_BASE_URL || 'http://localhost:3000',
    });

    return c.json({
      message:
        result.message === 'Password updated directly'
          ? t('password-changed-success')
          : t('forgot-password-email-sent'),
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return c.json({ message: t('user-not-found') }, 404);
    }

    throw err;
  }
};
