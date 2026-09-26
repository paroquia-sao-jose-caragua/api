import type { AppointmentSettings } from '@/entities/appointment-settings';

export interface AppointmentSettingsDAF {
  get(): Promise<AppointmentSettings>;
  save(settings: Partial<AppointmentSettings>): Promise<AppointmentSettings>;
}
