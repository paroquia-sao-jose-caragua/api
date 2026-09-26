import { getAppContext } from '@/http/utils/getAppContext';
import { makeRevokeUserSessionsUseCase } from '@/use-cases/factories/users/make-revoke-user-sessions-use-case';
import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error';

export const revokeSessions: ControllerFn = async (c) => {
  const { t } = getAppContext(c);
  const targetUserId = c.req.param('id');

  try {
    const revokeUserSessionsUseCase = makeRevokeUserSessionsUseCase(c);
    const { newTokenVersion } = await revokeUserSessionsUseCase.execute({
      targetUserId,
    });

    return c.json({
      message: t('sessions-revoked-success'),
      tokenVersion: newTokenVersion,
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return c.json({ message: t('user-not-found') }, 404);
    }

    throw err;
  }
};
