import type { TranslatorFn } from '@/dictionaries';
import { z } from 'zod';

export function useCreateAppointmentSchema(t: TranslatorFn) {
  return z.object({
    agentId: z.string().min(1, t('required-field')),
    serviceId: z.string().min(1, t('required-field')),
    communityId: z.string().nullable().optional(),
    requesterName: z.string().min(2, t('required-field')),
    requesterPhone: z.string().min(8, t('required-field')),
    requesterEmail: z.string().email().nullable().optional().or(z.literal('')),
    requesterRelationship: z.string().nullable().optional(),
    patientName: z.string().nullable().optional(),
    patientAddress: z.string().nullable().optional(),
    patientConditions: z
      .object({
        isBedridden: z.boolean().optional(),
        canSwallowHost: z.boolean().optional(),
        isLucid: z.boolean().optional(),
        notes: z.string().optional(),
      })
      .nullable()
      .optional(),
    appointmentDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, t('error-date-required')),
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, t('error-start-time-required')),
    requesterNotes: z.string().nullable().optional(),
  });
}

export function useCancelAppointmentSchema(t: TranslatorFn) {
  return z.object({
    cancellationReason: z.string().min(3, t('error-cancellation-reason-required')),
  });
}

export function useUpdateAppointmentStatusSchema(_t?: TranslatorFn) {
  return z.object({
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
    cancellationReason: z.string().nullable().optional(),
    privateNotes: z.string().nullable().optional(),
  });
}
