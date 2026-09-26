import type { UrgentAlert } from '@/entities/urgent-alert';
import type { UrgentAlertDAF } from '@/services/database/urgent-alert-daf';

interface GetActiveUrgentAlertUseCaseResponse {
  alert: UrgentAlert | null;
}

export class GetActiveUrgentAlertUseCase {
  private urgentAlertDAF: UrgentAlertDAF;

  constructor(urgentAlertDAF: UrgentAlertDAF) {
    this.urgentAlertDAF = urgentAlertDAF;
  }

  async execute(): Promise<GetActiveUrgentAlertUseCaseResponse> {
    const alert = await this.urgentAlertDAF.getActive();
    return { alert };
  }
}
