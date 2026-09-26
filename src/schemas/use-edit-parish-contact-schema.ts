import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useEditParishContactSchema = (t: TranslatorFn) => {
  const schema = z.object({
    phone: z.string().max(50, t('error-max-length', { max: 50 })).optional().nullable(),
    whatsapp: z.string().max(50, t('error-max-length', { max: 50 })).optional().nullable(),
    email: z.string().email(t('invalid-email')).optional().nullable().or(z.literal('')),
    address: z.string().max(500, t('error-max-length', { max: 500 })).optional().nullable(),
    officeHours: z.string().optional().nullable(),
    instagramUrl: z.string().max(500, t('error-max-length', { max: 500 })).optional().nullable(),
    youtubeUrl: z.string().max(500, t('error-max-length', { max: 500 })).optional().nullable(),
    facebookUrl: z.string().max(500, t('error-max-length', { max: 500 })).optional().nullable(),
    whatsappUrl: z.string().max(500, t('error-max-length', { max: 500 })).optional().nullable(),
  });

  return schema;
};
