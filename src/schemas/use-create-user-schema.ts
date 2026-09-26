import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useCreateUserSchema = (t: TranslatorFn) => {
  return z.object({
    name: z
      .string()
      .min(3, t('error-min-length', { min: 3 }))
      .max(255, t('error-max-length', { max: 255 })),
    email: z.string().email(t('invalid-email')),
    role: z.enum(
      ['admin', 'secretary', 'user', 'pastoral_agent', 'viewer'],
      {
        message: t('invalid-role'),
      },
    ),
    password: z.string().min(8, t('error-min-length', { min: 8 })).optional(),
    sendInvite: z.boolean().optional().default(false),
  });
};
