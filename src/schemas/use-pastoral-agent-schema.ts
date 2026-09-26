import type { TranslatorFn } from '@/dictionaries';
import { z } from 'zod';

export function useSavePastoralAgentSchema(t: TranslatorFn) {
  return z.object({
    name: z.string().min(2, t('required-field')),
    title: z.string().nullable().optional(),
    actingRole: z.string().min(2, t('required-field')),
    userId: z.string().nullable().optional(),
    phone: z.string().min(8, t('required-field')),
    email: z.string().email().nullable().optional().or(z.literal('')),
    communityId: z.string().nullable().optional(),
    photoId: z.string().nullable().optional(),
    acceptsAppointments: z.boolean().default(true),
    active: z.boolean().default(true),
    serviceIds: z.array(z.string()).optional(),
  });
}

export function useSaveAgentAvailabilitiesSchema(_t?: TranslatorFn) {
  return z.object({
    availabilities: z.array(
      z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        communityId: z.string().nullable().optional(),
        slotDurationMinutes: z.number().min(10).max(180).optional(),
        active: z.boolean().optional(),
      })
    ),
  });
}

export function useAddBlockedDateSchema(t: TranslatorFn) {
  return z.object({
    blockedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('error-date-required')),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
    reason: z.string().nullable().optional(),
  });
}
