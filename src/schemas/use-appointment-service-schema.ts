import { z } from 'zod';
import type { TranslatorFn } from '@/dictionaries';

export const useSaveAppointmentServiceSchema = (t: TranslatorFn) =>
  z.object({
    title: z
      .string({ required_error: t('error-min-length', { min: 2 }) })
      .min(2, t('error-min-length', { min: 2 }))
      .max(150, t('error-max-length', { max: 150 })),
    category: z.enum(['clergy_sacramental', 'home_visit', 'pastoral']),
    description: z.string().nullable().optional(),
    defaultDurationMinutes: z.coerce.number().int().min(5).max(480).default(30),
    requiresAddress: z.boolean().default(false),
    active: z.boolean().default(true),
  });
