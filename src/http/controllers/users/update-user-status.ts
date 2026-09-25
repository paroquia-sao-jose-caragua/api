import { getAppContext } from '@/http/utils/getAppContext';
import { useUpdateUserStatusSchema } from '@/schemas/use-update-user-status-schema';
import { makeUpdateUserStatusUseCase } from '@/use-cases/factories/users/make-update-user-status-use-case';
import { LastAdminError } from '@/use-cases/errors/last-admin-error';
import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error';

export const updateUserStatus: ControllerFn = async (c) => {
  const { inputs, user: currentUser, t } = getAppContext(c);
  const targetUserId = c.req.param('id');

  const validationSchema = useUpdateUserStatusSchema(t);
  const { status } = validationSchema.parse(inputs);

  try {
    const updateUserStatusUseCase = makeUpdateUserStatusUseCase(c);
    const { user } = await updateUserStatusUseCase.execute({
      targetUserId,
      newStatus: status,
      currentAdminId: currentUser.id,
    });

    return c.json({ user });
  } catch (err) {
    if (err instanceof LastAdminError) {
      return c.json({ message: t('error-cannot-suspend-last-admin') }, 400);
    }

    if (err instanceof UserNotFoundError) {
      return c.json({ message: t('user-not-found') }, 404);
    }

    throw err;
  }
};
