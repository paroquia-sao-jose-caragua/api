import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useChangePasswordSchema = (t: TranslatorFn) => {
  return z.object({
    currentPassword: z.string().min(1, t('required-field')),
    newPassword: z.string().min(8, t('error-min-length', { min: 8 })),
  });
};
