import { getAppContext } from '@/http/utils/getAppContext';
import { useUpdateUserRoleSchema } from '@/schemas/use-update-user-role-schema';
import { makeUpdateUserRoleUseCase } from '@/use-cases/factories/users/make-update-user-role-use-case';
import { LastAdminError } from '@/use-cases/errors/last-admin-error';
import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error';

export const updateUserRole: ControllerFn = async (c) => {
  const { inputs, user: currentUser, t } = getAppContext(c);
  const targetUserId = c.req.param('id');

  const validationSchema = useUpdateUserRoleSchema(t);
  const { role } = validationSchema.parse(inputs);

  try {
    const updateUserRoleUseCase = makeUpdateUserRoleUseCase(c);
    const { user } = await updateUserRoleUseCase.execute({
      targetUserId,
      newRole: role,
      currentAdminId: currentUser.id,
    });

    return c.json({ user });
  } catch (err) {
    if (err instanceof LastAdminError) {
      return c.json({ message: t('error-cannot-demote-last-admin') }, 400);
    }

    if (err instanceof UserNotFoundError) {
      return c.json({ message: t('user-not-found') }, 404);
    }

    throw err;
  }
};
