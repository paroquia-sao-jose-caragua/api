import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useCommunitySchema = (t: TranslatorFn) => {
  const communitySchema = z.object({
    name: z
      .string()
      .min(1, t('required-field'))
      .max(255, t('error-max-length', { max: 255 })),
    type: z.enum(['chapel', 'parish_church'], {
      message: t('invalid-community-type'),
    }),
    address: z
      .string()
      .min(1, t('required-field'))
      .max(500, t('error-max-length', { max: 500 })),
    coverId: z.ulid(t('invalid-file-id')),
    heroSubtitle: z.string().max(500, t('error-max-length', { max: 500 })).optional().nullable(),
    aboutTitle: z.string().max(255, t('error-max-length', { max: 255 })).optional().nullable(),
    aboutDescription: z.string().optional().nullable(),
    historySummary: z.string().optional().nullable(),
    patronName: z.string().max(255, t('error-max-length', { max: 255 })).optional().nullable(),
    patronDescription: z.string().optional().nullable(),
    patronPhotoId: z.string().ulid(t('invalid-file-id')).optional().nullable().or(z.literal('')),
    photos: z
      .array(
        z.object({
          id: z.string().optional(),
          photoId: z.string().ulid(t('invalid-file-id')),
          caption: z.string().max(255, t('error-max-length', { max: 255 })).optional().nullable(),
          orderIndex: z.number().optional(),
        }),
      )
      .optional(),
  });

  return communitySchema;
};
