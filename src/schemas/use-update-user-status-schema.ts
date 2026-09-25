import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useUpdateUserStatusSchema = (t: TranslatorFn) => {
  return z.object({
    status: z.enum(['active', 'suspended', 'pending'], {
      message: t('invalid-status'),
    }),
  });
};
