import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useListUsersQueriesSchema = (_t: TranslatorFn) => {
  return z.object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    role: z
      .enum(['admin', 'secretary', 'user', 'pastoral_agent', 'viewer'])
      .optional(),
    status: z.enum(['active', 'suspended', 'pending']).optional(),
  });
};
