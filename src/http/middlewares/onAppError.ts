import type { HTTPResponseError } from 'hono/types';
import type z from 'zod';
import { ZodError } from 'zod';
import { getAppContext } from '@/http/utils/getAppContext';
import { DatabaseError } from '@/errors/DatabaseError';
import { log } from '@/services/log';

export const onAppError = async (
  error: Error | HTTPResponseError,
  c: DomainContext,
) => {
  const { t, inputs } = getAppContext(c);

  if (error instanceof ZodError) {
    return c.json(
      {
        message: t('error-validation'),
        errors: error.issues.map((err: z.core.$ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
      400,
    );
  }

  if (error instanceof DatabaseError) {
    c.executionCtx.waitUntil(
      log({
        env: c.env,
        data: {
          endpoint: c.req.url,
          method: c.req.method,
          inputs,
        },
        error,
      }),
    );

    return c.json(
      {
        message: t('error-internal-server'),
      },
      500,
    );
  }

  c.executionCtx.waitUntil(
    log({
      env: c.env,
      data: {
        endpoint: c.req.url,
        method: c.req.method,
        inputs,
      },
      error,
    }),
  );

  return c.json(
    {
      message: t('error-internal-server'),
    },
    500,
  );
};
