import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useForgotPasswordSchema = (t: TranslatorFn) => {
  return z.object({
    email: z.string().email(t('invalid-email')),
  });
};
