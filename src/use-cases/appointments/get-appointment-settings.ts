import type { AppointmentSettingsDAF } from '@/services/database/appointment-settings-daf';
import type { AppointmentSettings } from '@/entities/appointment-settings';

export class GetAppointmentSettingsUseCase {
  constructor(private appointmentSettingsDAF: AppointmentSettingsDAF) {}

  async execute(): Promise<{ settings: AppointmentSettings }> {
    const settings = await this.appointmentSettingsDAF.get();
    return { settings };
  }
}
