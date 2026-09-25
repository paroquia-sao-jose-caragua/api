import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useAdminResetPasswordSchema = (t: TranslatorFn) => {
  return z.object({
    password: z.string().min(8, t('error-min-length', { min: 8 })).optional(),
    sendEmail: z.boolean().optional().default(true),
  });
};
