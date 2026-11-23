import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useNoticeSchema = (t: TranslatorFn) => {
  return z.object({
    title: z
      .string()
      .min(1, t('required-field'))
      .max(255, t('error-max-length', { max: 255 })),
    summary: z
      .string()
      .max(500, t('error-max-length', { max: 500 }))
      .optional()
      .nullable(),
    description: z.string().min(1, t('required-field')),
    variant: z.enum(['alert', 'info', 'solemnity']).default('info'),
    imageId: z.ulid(t('invalid-file-id')).optional().nullable(),
    actionText: z
      .string()
      .max(100, t('error-max-length', { max: 100 }))
      .optional()
      .nullable(),
    actionUrl: z
      .string()
      .max(500, t('error-max-length', { max: 500 }))
      .optional()
      .nullable(),
    pinned: z.boolean().default(false),
    active: z.boolean().default(true),
    startsAt: z.string().datetime().optional().nullable(),
    endsAt: z.string().datetime().optional().nullable(),
  });
};
