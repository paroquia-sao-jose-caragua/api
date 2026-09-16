import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useAnnouncementSchema = (t: TranslatorFn) => {
  return z.object({
    badgeText: z.string().max(100, t('error-max-length', { max: 100 })).optional().nullable(),
    title: z.string().min(1, t('required-field')).max(255, t('error-max-length', { max: 255 })),
    description: z.string().min(1, t('required-field')),
    actionText: z.string().max(100, t('error-max-length', { max: 100 })).optional().nullable(),
    actionUrl: z.string().max(500, t('error-max-length', { max: 500 })).optional().nullable(),
    coverDesktopId: z.ulid(t('invalid-file-id')),
    coverTabletId: z.ulid(t('invalid-file-id')).optional().nullable(),
    coverMobileId: z.ulid(t('invalid-file-id')).optional().nullable(),
    sortOrder: z.number().int().default(0),
    active: z.boolean().default(true),
    startsAt: z.string().datetime().optional().nullable(),
    endsAt: z.string().datetime().optional().nullable(),
  });
};

export const useReorderAnnouncementsSchema = (t: TranslatorFn) => {
  return z.object({
    orderedIds: z.array(z.ulid(t('invalid-file-id'))).min(1, t('required-field')),
  });
};
