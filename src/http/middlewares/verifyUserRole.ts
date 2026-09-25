import type { Context, Next } from 'hono';
import type { UserRole } from '@/entities/user';
import { getAppContext } from '../utils/getAppContext';

export function verifyUserRole(roleToVerify: UserRole | UserRole[]) {
  return async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next,
  ) => {
    const { user, t } = getAppContext(c);

    const allowed = Array.isArray(roleToVerify)
      ? roleToVerify.includes(user.role)
      : user.role === roleToVerify;

    if (!allowed) {
      return c.json({ message: t('unauthorized') }, 403);
    }

    await next();
  };
}
