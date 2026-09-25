import type { Context, Next } from 'hono';
import { verifyAccessTokenSafe } from 'serverless-crypto-utils/access-token';
import { getAppContext } from '../utils/getAppContext';

export const verifyToken = async (
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next,
) => {
  const { t } = getAppContext(c);

  const accessToken = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!accessToken) {
    return c.json({ error: t('invalid-token-or-expired') }, 401);
  }

  const result = await verifyAccessTokenSafe({
    accessToken,
    encryptionSecret: c.env.ENCRYPTION_SECRET,
    signingSecret: c.env.SIGNING_SECRET,
  });

  if (!result.success) {
    return c.json({ error: t('invalid-token-or-expired') }, 401);
  }

  const data = JSON.parse(result.data);
  const tokenUser = data.user;

  if (!tokenUser || !tokenUser.id) {
    return c.json({ error: t('invalid-token-or-expired') }, 401);
  }

  // Validar se o usuário foi suspenso ou se token_version foi incrementado
  if (c.env.DB) {
    const dbUser = await c.env.DB
      .prepare('SELECT status, token_version, role FROM users WHERE id = ?')
      .bind(tokenUser.id)
      .first<{ status: string; token_version: number; role: string }>();

    if (!dbUser || dbUser.status === 'suspended') {
      return c.json({ error: t('user-suspended-or-inactive') }, 401);
    }

    if (
      tokenUser.tokenVersion !== undefined &&
      dbUser.token_version > tokenUser.tokenVersion
    ) {
      return c.json({ error: t('invalid-token-or-expired') }, 401);
    }

    c.set('user', {
      ...tokenUser,
      role: dbUser.role as any,
      status: dbUser.status as any,
      tokenVersion: dbUser.token_version,
    });
  } else {
    c.set('user', tokenUser);
  }

  return await next();
};
