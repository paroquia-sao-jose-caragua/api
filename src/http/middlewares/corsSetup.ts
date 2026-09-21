import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';

export const corsSetup: MiddlewareHandler = cors({
  origin: (origin, c) => {
    const allowedOrigins: string[] = [c.env.DASHBOARD_BASE_URL];

    const isAllowed = allowedOrigins.includes(origin ?? '');

    console.log({isAllowed, allowedOrigins, origin})

    return isAllowed ? origin : null;
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
