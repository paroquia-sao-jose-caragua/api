import type { UrgentAlert } from '@/entities/urgent-alert';
import type { UrgentAlertDAF } from '@/services/database/urgent-alert-daf';

interface GetUrgentAlertUseCaseResponse {
  alert: UrgentAlert | null;
}

export class GetUrgentAlertUseCase {
  private urgentAlertDAF: UrgentAlertDAF;

  constructor(urgentAlertDAF: UrgentAlertDAF) {
    this.urgentAlertDAF = urgentAlertDAF;
  }

  async execute(): Promise<GetUrgentAlertUseCaseResponse> {
    const alert = await this.urgentAlertDAF.get();
    return { alert };
  }
}
