import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useEditCommunityPatronSchema = (t: TranslatorFn) => {
  const schema = z.object({
    patronName: z
      .string()
      .max(255, t('error-max-length', { max: 255 }))
      .optional()
      .nullable(),
    patronDescription: z.string().optional().nullable(),
    patronPhotoId: z
      .string()
      .ulid(t('invalid-file-id'))
      .optional()
      .nullable()
      .or(z.literal('')),
  });

  return schema;
};
