import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useClergySchema = (t: TranslatorFn) => {
  const clergySchema = z.object({
    title: z.string().max(100, t('error-max-length', { max: 100 })).optional().nullable(),
    name: z
      .string()
      .min(1, t('required-field'))
      .max(255, t('error-max-length', { max: 255 })),
    position: z.enum(
      [
        'supreme_pontiff',
        'diocesan_bishop',
        'parish_priest',
        'permanent_deacon',
        'vicar',
        'other',
      ],
      t('invalid-clergy-position'),
    ),
    roleName: z.string().max(100).optional().nullable(),
    shortIntro: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    orderIndex: z.coerce.number().optional().default(0),
    isMain: z.coerce.boolean().optional().default(false),
    photoId: z.string().optional().nullable(),
  });

  return clergySchema;
};
