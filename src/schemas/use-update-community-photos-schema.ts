import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useUpdateCommunityPhotosSchema = (t: TranslatorFn) => {
  const schema = z.object({
    photos: z.array(
      z.object({
        id: z.string().optional(),
        photoId: z.string().ulid(t('invalid-file-id')),
        caption: z.string().max(255, t('error-max-length', { max: 255 })).optional().nullable(),
        orderIndex: z.number().optional(),
      }),
    ),
  });

  return schema;
};
