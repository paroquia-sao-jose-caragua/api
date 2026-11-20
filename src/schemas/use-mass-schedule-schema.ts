import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export function useMassScheduleSchema(t: TranslatorFn) {
  const schema = z
    .object({
      title: z
        .string()
        .max(255, t('error-max-length', { max: 255 }))
        .optional(),
      type: z.enum<('ordinary' | 'devotional' | 'solemnity')[]>(
        ['ordinary', 'devotional', 'solemnity'],
        t('invalid-mass-schedule-type'),
      ),
      orientations: z
        .string()
        .max(255, t('error-max-length', { max: 255 }))
        .optional(),
      isPrecept: z.boolean(),
      recurrenceType: z.enum<('weekly' | 'monthly')[]>(
        ['weekly', 'monthly'],
        t('invalid-recurrence-type'),
      ),
      dayOfWeek: z
        .number()
        .min(0, t('error-day-of-week-range', { min: 0, max: 6 }))
        .max(6, t('error-day-of-week-range', { min: 0, max: 6 }))
        .optional(),
      dayOfMonth: z
        .number()
        .min(1, t('error-day-of-month-range', { min: 1, max: 31 }))
        .max(31, t('error-day-of-month-range', { min: 1, max: 31 }))
        .optional(),
      weekOfMonth: z
        .number()
        .min(1, t('error-week-of-month-range', { min: 1, max: 5 }))
        .max(5, t('error-week-of-month-range', { min: 1, max: 5 }))
        .optional(),
      startDate: z.string(t('error-date-required')).refine(
        (date) => {
          if (!date) return true;
          return !Number.isNaN(Date.parse(date));
        },
        { message: t('invalid-start-date') },
      ),
      endDate: z
        .string(t('error-date-required'))
        .refine(
          (date) => {
            if (!date) return true;
            return !Number.isNaN(Date.parse(date));
          },
          { message: t('invalid-end-date') },
        )
        .optional(),
      startTime: z
        .string(t('error-start-time-required'))
        .min(1, t('error-start-time-required'))
        .refine(
          (time) => {
            if (!time) return false;
            const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
            return timeRegex.test(time);
          },
          { message: t('invalid-time-format') },
        ),
      active: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (
        data.recurrenceType === 'weekly' &&
        (data.dayOfWeek === undefined || data.dayOfWeek === null)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dayOfWeek'],
          message: t('error-day-of-week-required'),
        });
      }

      if (
        data.recurrenceType === 'monthly' &&
        (data.dayOfMonth === undefined || data.dayOfMonth === null) &&
        data.weekOfMonth === undefined
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dayOfMonth'],
          message: t('error-day-of-month-required'),
        });
      }
    });

  return schema;
}
