import { getAppContext } from '@/http/utils/getAppContext';
import { makeResendUserInviteUseCase } from '@/use-cases/factories/users/make-resend-user-invite-use-case';
import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error';
import { UserNotPendingError } from '@/use-cases/errors/user-not-pending-error';

export const resendUserInvite: ControllerFn = async (c) => {
  const { t } = getAppContext(c);
  const targetUserId = c.req.param('id');

  try {
    const resendUserInviteUseCase = makeResendUserInviteUseCase(c);
    await resendUserInviteUseCase.execute({
      targetUserId,
      panelBaseUrl: c.env.PANEL_BASE_URL || 'http://localhost:3000',
    });

    return c.json({
      message: t('invite-resent-success'),
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return c.json({ message: t('user-not-found') }, 404);
    }

    if (err instanceof UserNotPendingError) {
      return c.json({ message: t('user-not-pending') }, 400);
    }

    throw err;
  }
};
