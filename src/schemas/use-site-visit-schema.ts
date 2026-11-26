import { z } from 'zod';

export const useRegisterSiteVisitSchema = () =>
  z.object({
    entryPath: z.string().max(200).optional(),
  });

export const useGetSiteVisitStatsQuerySchema = () =>
  z.object({
    days: z.coerce.number().int().min(7).max(90).optional(),
  });
