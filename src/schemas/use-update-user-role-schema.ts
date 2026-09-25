import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useUpdateUserRoleSchema = (t: TranslatorFn) => {
  return z.object({
    role: z.enum(
      ['admin', 'secretary', 'user', 'pastoral_agent', 'viewer'],
      {
        message: t('invalid-role'),
      },
    ),
  });
};
