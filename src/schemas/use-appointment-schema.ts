import type { TranslatorFn } from '@/dictionaries';
import { z } from 'zod';

export function useCreateAppointmentSchema(t: TranslatorFn) {
  return z
    .object({
      kind: z.enum(['appointment', 'commitment']).optional().default('appointment'),
      title: z.string().nullable().optional(),
      agentId: z.string().min(1, t('required-field')),
      serviceId: z.string().nullable().optional(),
      communityId: z.string().nullable().optional(),
      requesterName: z.string().nullable().optional(),
      requesterPhone: z.string().nullable().optional(),
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
      endTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .nullable()
        .optional(),
      durationMinutes: z.number().int().min(5).max(720).nullable().optional(),
      requesterNotes: z.string().nullable().optional(),
      status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
      privatePastoralNotes: z.string().nullable().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.kind === 'commitment') {
        if (!data.title || data.title.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['title'],
            message: t('required-field'),
          });
        }
        if (data.endTime && data.endTime <= data.startTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['endTime'],
            message: t('required-field'),
          });
        }
        return;
      }

      if (!data.serviceId || data.serviceId.trim().length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['serviceId'],
          message: t('required-field'),
        });
      }
      if (!data.requesterName || data.requesterName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['requesterName'],
          message: t('required-field'),
        });
      }
      if (!data.requesterPhone || data.requesterPhone.trim().length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['requesterPhone'],
          message: t('required-field'),
        });
      }
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
