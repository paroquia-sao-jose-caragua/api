import { getAppContext } from '@/http/utils/getAppContext';
import { useUpdateUserSchema } from '@/schemas/use-update-user-schema';
import { makeUpdateUserUseCase } from '@/use-cases/factories/users/make-update-user-use-case';
import { ResourceAlreadyExistsError } from '@/use-cases/errors/resource-already-exists-error';
import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error';

export const updateUser: ControllerFn = async (c) => {
  const { inputs, t } = getAppContext(c);
  const id = c.req.param('id');

  const validationSchema = useUpdateUserSchema(t);
  const { name, email } = validationSchema.parse(inputs);

  try {
    const updateUserUseCase = makeUpdateUserUseCase(c);
    const { user } = await updateUserUseCase.execute({
      id,
      name,
      email,
    });

    return c.json({
      message: t('user-updated-successfully'),
      user,
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return c.json({ message: t('user-not-found') }, 404);
    }

    if (err instanceof ResourceAlreadyExistsError) {
      return c.json({ message: t('user-email-already-exists') }, 409);
    }

    throw err;
  }
};
