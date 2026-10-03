import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useUpdateUserSchema = (t: TranslatorFn) => {
  return z.object({
    name: z
      .string()
      .min(3, t('error-min-length', { min: 3 }))
      .max(255, t('error-max-length', { max: 255 })),
    email: z.string().email(t('invalid-email')),
  });
};
