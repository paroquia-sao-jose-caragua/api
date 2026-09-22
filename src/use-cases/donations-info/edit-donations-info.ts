import type { DonationsInfo } from '@/entities/donations-info';
import type { DonationsInfoDAF } from '@/services/database/donations-info-daf';

interface EditDonationsInfoUseCaseRequest {
  pixKey?: string | null;
  pixKeyType?: string | null;
  pixReceiverName?: string | null;
  pixReceiverCity?: string | null;
  bankName?: string | null;
  bankAgency?: string | null;
  bankAccount?: string | null;
  bankAccountType?: string | null;
  bankCnpj?: string | null;
  bankBeneficiary?: string | null;
  receiptWhatsapp?: string | null;
  receiptWhatsappUrl?: string | null;
  receiptEmail?: string | null;
  title?: string | null;
  description?: string | null;
  pastoralCenterTitle?: string | null;
  pastoralCenterDescription?: string | null;
}

interface EditDonationsInfoUseCaseResponse {
  donations: DonationsInfo;
}

export class EditDonationsInfoUseCase {
  private donationsInfoDAF: DonationsInfoDAF;

  constructor(donationsInfoDAF: DonationsInfoDAF) {
    this.donationsInfoDAF = donationsInfoDAF;
  }

  async execute(
    request: EditDonationsInfoUseCaseRequest,
  ): Promise<EditDonationsInfoUseCaseResponse> {
    const existing = await this.donationsInfoDAF.get();

    const donationsToSave: DonationsInfo = {
      id: 'primary',
      pixKey: request.pixKey !== undefined ? request.pixKey : existing?.pixKey,
      pixKeyType: request.pixKeyType !== undefined ? request.pixKeyType : (existing?.pixKeyType || 'phone'),
      pixReceiverName: request.pixReceiverName !== undefined ? request.pixReceiverName : existing?.pixReceiverName,
      pixReceiverCity: request.pixReceiverCity !== undefined ? request.pixReceiverCity : existing?.pixReceiverCity,
      bankName: request.bankName !== undefined ? request.bankName : existing?.bankName,
      bankAgency: request.bankAgency !== undefined ? request.bankAgency : existing?.bankAgency,
      bankAccount: request.bankAccount !== undefined ? request.bankAccount : existing?.bankAccount,
      bankAccountType: request.bankAccountType !== undefined ? request.bankAccountType : existing?.bankAccountType,
      bankCnpj: request.bankCnpj !== undefined ? request.bankCnpj : existing?.bankCnpj,
      bankBeneficiary: request.bankBeneficiary !== undefined ? request.bankBeneficiary : existing?.bankBeneficiary,
      receiptWhatsapp: request.receiptWhatsapp !== undefined ? request.receiptWhatsapp : existing?.receiptWhatsapp,
      receiptWhatsappUrl: request.receiptWhatsappUrl !== undefined ? request.receiptWhatsappUrl : existing?.receiptWhatsappUrl,
      receiptEmail: request.receiptEmail !== undefined ? request.receiptEmail : existing?.receiptEmail,
      title: request.title !== undefined ? request.title : existing?.title,
      description: request.description !== undefined ? request.description : existing?.description,
      pastoralCenterTitle: request.pastoralCenterTitle !== undefined ? request.pastoralCenterTitle : existing?.pastoralCenterTitle,
      pastoralCenterDescription: request.pastoralCenterDescription !== undefined ? request.pastoralCenterDescription : existing?.pastoralCenterDescription,
      updatedAt: new Date().toISOString(),
    };

    await this.donationsInfoDAF.save(donationsToSave);

    return { donations: donationsToSave };
  }
}
