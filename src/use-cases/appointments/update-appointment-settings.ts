import type { AppointmentSettingsDAF } from '@/services/database/appointment-settings-daf';
import type { AppointmentSettings } from '@/entities/appointment-settings';

interface UpdateAppointmentSettingsRequest {
  enabled?: boolean;
  suspendedTitle?: string;
  suspendedMessage?: string;
}

export class UpdateAppointmentSettingsUseCase {
  constructor(private appointmentSettingsDAF: AppointmentSettingsDAF) {}

  async execute(
    data: UpdateAppointmentSettingsRequest
  ): Promise<{ settings: AppointmentSettings }> {
    const settings = await this.appointmentSettingsDAF.save(data);
    return { settings };
  }
}
