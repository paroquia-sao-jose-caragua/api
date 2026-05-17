import type { TranslatorFn } from '@/dictionaries';
import z from 'zod';

export function useListCalendarQueriesSchema(t: TranslatorFn) {
  const schema = z.object({
    month: z
      .string()
      .refine(
        (value) => {
          const month = Number(value);
          return !Number.isNaN(month) && month >= 1 && month <= 12;
        },
        { message: t('invalid-month') },
      )
      .transform((value) => Number(value)),
    year: z
      .string()
      .refine(
        (value) => {
          const year = Number(value);
          return !Number.isNaN(year);
        },
        { message: t('invalid-year') },
      )
      .refine(
        (value) => {
          const minYear = new Date().getFullYear() - 1;
          const maxYear = new Date().getFullYear() + 1;
          const year = Number(value);

          return year >= minYear && year <= maxYear;
        },
        {
          message: t('invalid-year-range', {
            minYear: new Date().getFullYear() - 1,
            maxYear: new Date().getFullYear() + 1,
          }),
        },
      )
      .transform((value) => Number(value)),
    communityId: z.string().optional(),
  });

  return schema;
}
