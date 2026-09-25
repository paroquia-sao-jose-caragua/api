import type { AppointmentSettings } from '@/entities/appointment-settings';
import type { AppointmentSettingsDAF } from '@/services/database/appointment-settings-daf';

export class InMemoryAppointmentSettingsDAF implements AppointmentSettingsDAF {
  public settings: AppointmentSettings = {
    id: 'primary',
    enabled: true,
    suspendedTitle: 'Agendamentos Temporariamente Suspensos',
    suspendedMessage: 'Os agendamentos online estão temporariamente suspensos. Para urgências, procure a secretaria paroquial.',
    updatedAt: new Date().toISOString(),
  };

  async get(): Promise<AppointmentSettings> {
    return { ...this.settings };
  }

  async save(data: Partial<AppointmentSettings>): Promise<AppointmentSettings> {
    this.settings = {
      ...this.settings,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.settings };
  }
}
