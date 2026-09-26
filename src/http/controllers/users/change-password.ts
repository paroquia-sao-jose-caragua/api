import { getAppContext } from '@/http/utils/getAppContext';
import { useChangePasswordSchema } from '@/schemas/use-change-password-schema';
import { makeChangePasswordUseCase } from '@/use-cases/factories/users/make-change-password-use-case';
import { InvalidCurrentPasswordError } from '@/use-cases/errors/invalid-current-password-error';
import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error';

export const changePassword: ControllerFn = async (c) => {
  const { inputs, user, t } = getAppContext(c);

  const validationSchema = useChangePasswordSchema(t);
  const { currentPassword, newPassword } = validationSchema.parse(inputs);

  try {
    const changePasswordUseCase = makeChangePasswordUseCase(c);
    await changePasswordUseCase.execute({
      userId: user.id,
      currentPassword,
      newPassword,
    });

    return c.json({
      message: t('password-changed-success'),
    });
  } catch (err) {
    if (err instanceof InvalidCurrentPasswordError) {
      return c.json({ message: t('invalid-current-password') }, 400);
    }

    if (err instanceof UserNotFoundError) {
      return c.json({ message: t('user-not-found') }, 404);
    }

    throw err;
  }
};
