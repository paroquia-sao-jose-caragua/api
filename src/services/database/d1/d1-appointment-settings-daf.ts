import type { AppointmentSettings } from '@/entities/appointment-settings';
import type { AppointmentSettingsDAF } from '../appointment-settings-daf';

interface AppointmentSettingsRow {
  id: string;
  enabled: number;
  suspended_title: string;
  suspended_message: string;
  updated_at: string | null;
}

function mapRowToAppointmentSettings(row: AppointmentSettingsRow): AppointmentSettings {
  return {
    id: row.id,
    enabled: Boolean(row.enabled),
    suspendedTitle: row.suspended_title,
    suspendedMessage: row.suspended_message,
    updatedAt: row.updated_at,
  };
}

export class D1AppointmentSettingsDAF implements AppointmentSettingsDAF {
  constructor(private d1: D1Database) {}

  async get(): Promise<AppointmentSettings> {
    const row = await this.d1
      .prepare('SELECT * FROM appointment_settings WHERE id = ?')
      .bind('primary')
      .first<AppointmentSettingsRow>();

    if (!row) {
      return {
        id: 'primary',
        enabled: true,
        suspendedTitle: 'Agendamentos Temporariamente Suspensos',
        suspendedMessage:
          'Os agendamentos online estão temporariamente suspensos pela secretaria paroquial. Para urgências ou informações, entre em contato diretamente com a secretaria.',
        updatedAt: null,
      };
    }

    return mapRowToAppointmentSettings(row);
  }

  async save(settings: Partial<AppointmentSettings>): Promise<AppointmentSettings> {
    const current = await this.get();
    const updated: AppointmentSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    await this.d1
      .prepare(
        `INSERT INTO appointment_settings (id, enabled, suspended_title, suspended_message, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           enabled = excluded.enabled,
           suspended_title = excluded.suspended_title,
           suspended_message = excluded.suspended_message,
           updated_at = excluded.updated_at`
      )
      .bind(
        'primary',
        updated.enabled ? 1 : 0,
        updated.suspendedTitle,
        updated.suspendedMessage,
        updated.updatedAt
      )
      .run();

    return updated;
  }
}
