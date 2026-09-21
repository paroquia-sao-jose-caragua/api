import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useEditCommunityAboutSchema = (t: TranslatorFn) => {
  return z.object({
    heroSubtitle: z
      .string()
      .max(500, t('error-max-length', { max: 500 }))
      .optional()
      .nullable(),
    aboutTitle: z
      .string()
      .max(255, t('error-max-length', { max: 255 }))
      .optional()
      .nullable(),
    aboutDescription: z.string().optional().nullable(),
    historySummary: z.string().optional().nullable(),
  });
};
