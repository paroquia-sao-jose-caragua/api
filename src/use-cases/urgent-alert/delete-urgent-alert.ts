import type { UrgentAlertDAF } from '@/services/database/urgent-alert-daf';

export class DeleteUrgentAlertUseCase {
  private urgentAlertDAF: UrgentAlertDAF;

  constructor(urgentAlertDAF: UrgentAlertDAF) {
    this.urgentAlertDAF = urgentAlertDAF;
  }

  async execute(): Promise<void> {
    await this.urgentAlertDAF.delete();
  }
}
