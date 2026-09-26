import { z } from 'zod';

export const useUrgentAlertSchema = z.object({
  active: z.boolean().default(false),
  text: z.string().max(255).default(''),
  variant: z.enum(['alert', 'info', 'solemnity']).default('alert'),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  hasModal: z.boolean().default(false),
  modalButtonText: z.string().max(50).nullable().optional(),
  modalTitle: z.string().max(255).nullable().optional(),
  modalDescription: z.string().nullable().optional(),
  modalImageId: z.string().max(26).nullable().optional(),
  modalActionText: z.string().max(100).nullable().optional(),
  modalActionUrl: z.string().max(500).nullable().optional(),
});

export type UrgentAlertInput = z.infer<typeof useUrgentAlertSchema>;
