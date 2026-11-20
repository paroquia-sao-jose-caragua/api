import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';

export const corsSetup: MiddlewareHandler = cors({
  origin: (origin, c) => {
    const allowedOrigins: string[] = [c.env.PANEL_BASE_URL, c.env.SITE_BASE_URL].filter(Boolean);

    // When Origin is empty (e.g. stripped by Cloudflare edge), fall back to Referer
    const effectiveOrigin = origin || (() => {
      const referer = c.req.header('Referer');
      if (!referer) return '';
      try {
        const { origin: refererOrigin } = new URL(referer);
        return refererOrigin;
      } catch {
        return '';
      }
    })();

    const isDev = c.env.ENVIRONMENT === 'development' || !c.env.ENVIRONMENT;
    const isLocalhost = effectiveOrigin.includes('localhost') || effectiveOrigin.includes('127.0.0.1');

    const isAllowed =
      (isDev && isLocalhost) ||
      (!!effectiveOrigin && allowedOrigins.includes(effectiveOrigin));

    return isAllowed ? effectiveOrigin : null;
  },
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'Accept-Language',
    'X-Timezone-Offset',
    'X-Timezone',
    'Cache-Control',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE'],
  maxAge: 600,
  credentials: true,
});
