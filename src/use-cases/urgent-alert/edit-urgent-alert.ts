import type { UrgentAlert, UrgentAlertVariant } from '@/entities/urgent-alert';
import type { UrgentAlertDAF } from '@/services/database/urgent-alert-daf';

interface EditUrgentAlertUseCaseRequest {
  active: boolean;
  text: string;
  variant: UrgentAlertVariant;
  startsAt?: string | null;
  endsAt?: string | null;
  hasModal: boolean;
  modalButtonText?: string | null;
  modalTitle?: string | null;
  modalDescription?: string | null;
  modalImageId?: string | null;
  modalActionText?: string | null;
  modalActionUrl?: string | null;
}

interface EditUrgentAlertUseCaseResponse {
  alert: UrgentAlert;
}

export class EditUrgentAlertUseCase {
  private urgentAlertDAF: UrgentAlertDAF;

  constructor(urgentAlertDAF: UrgentAlertDAF) {
    this.urgentAlertDAF = urgentAlertDAF;
  }

  async execute(
    request: EditUrgentAlertUseCaseRequest,
  ): Promise<EditUrgentAlertUseCaseResponse> {
    const existing = await this.urgentAlertDAF.get();

    const alertToSave: UrgentAlert = {
      id: 'primary',
      active: request.active,
      text: request.text,
      variant: request.variant,
      startsAt: request.startsAt !== undefined ? request.startsAt : existing?.startsAt,
      endsAt: request.endsAt !== undefined ? request.endsAt : existing?.endsAt,
      hasModal: request.hasModal,
      modalButtonText: request.modalButtonText !== undefined ? request.modalButtonText : existing?.modalButtonText,
      modalTitle: request.modalTitle !== undefined ? request.modalTitle : existing?.modalTitle,
      modalDescription: request.modalDescription !== undefined ? request.modalDescription : existing?.modalDescription,
      modalImageId: request.modalImageId !== undefined ? request.modalImageId : existing?.modalImageId,
      modalActionText: request.modalActionText !== undefined ? request.modalActionText : existing?.modalActionText,
      modalActionUrl: request.modalActionUrl !== undefined ? request.modalActionUrl : existing?.modalActionUrl,
      updatedAt: new Date().toISOString(),
    };

    await this.urgentAlertDAF.save(alertToSave);

    return { alert: alertToSave };
  }
}
