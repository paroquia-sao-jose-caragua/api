import { z } from 'zod';

export const useEditDonationsInfoSchema = z.object({
  pixKey: z.string().max(150).nullable().optional(),
  pixKeyType: z.string().max(50).nullable().optional(),
  pixReceiverName: z.string().max(150).nullable().optional(),
  pixReceiverCity: z.string().max(100).nullable().optional(),
  bankName: z.string().max(100).nullable().optional(),
  bankAgency: z.string().max(50).nullable().optional(),
  bankAccount: z.string().max(50).nullable().optional(),
  bankAccountType: z.string().max(50).nullable().optional(),
  bankCnpj: z.string().max(50).nullable().optional(),
  bankBeneficiary: z.string().max(150).nullable().optional(),
  receiptWhatsapp: z.string().max(50).nullable().optional(),
  receiptWhatsappUrl: z.string().max(500).nullable().optional(),
  receiptEmail: z.string().max(150).nullable().optional(),
  title: z.string().max(200).nullable().optional(),
  description: z.string().nullable().optional(),
  pastoralCenterTitle: z.string().max(200).nullable().optional(),
  pastoralCenterDescription: z.string().nullable().optional(),
});

export type EditDonationsInfoSchema = z.infer<typeof useEditDonationsInfoSchema>;
