import type { Context } from 'hono';
import { makeGetUserUseCase } from '@/use-cases/factories/users/make-get-user-use-case';
import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error';
import { getAppContext } from '@/http/utils/getAppContext';

export const getUser = async (c: Context) => {
  const { params, t } = getAppContext(c);
  const { id } = params

  try {
    const getUserUseCase = makeGetUserUseCase(c);
    const { user } = await getUserUseCase.execute({ id });

    return c.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      200
    );
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return c.json({ message: t('user-not-found') }, 404);
    }

    throw err;
  }
};
