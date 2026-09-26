import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useResetPasswordSchema = (t: TranslatorFn) => {
  return z
    .object({
      token: z.string().min(1, t('required-field')),
      password: z.string().min(8, t('error-min-length', { min: 8 })).optional(),
      newPassword: z.string().min(8, t('error-min-length', { min: 8 })).optional(),
    })
    .transform((data, ctx) => {
      const password = data.password ?? data.newPassword;
      if (!password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: t('required-field'),
        });
        return z.NEVER;
      }
      return {
        token: data.token,
        newPassword: password,
      };
    });
};
