import type { UrgentAlert, UrgentAlertVariant } from '@/entities/urgent-alert';
import type { UrgentAlertDAF } from '../urgent-alert-daf';

interface UrgentAlertRow {
  id: string;
  active: number;
  text: string;
  variant: string;
  starts_at: string | null;
  ends_at: string | null;
  has_modal: number;
  modal_button_text: string | null;
  modal_title: string | null;
  modal_description: string | null;
  modal_image_id: string | null;
  modal_action_text: string | null;
  modal_action_url: string | null;
  created_at: string;
  updated_at: string | null;
}

export class D1UrgentAlertDAF implements UrgentAlertDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  private mapRowToEntity(row: UrgentAlertRow): UrgentAlert {
    return {
      id: row.id,
      active: Boolean(row.active),
      text: row.text,
      variant: (row.variant as UrgentAlertVariant) || 'alert',
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      hasModal: Boolean(row.has_modal),
      modalButtonText: row.modal_button_text,
      modalTitle: row.modal_title,
      modalDescription: row.modal_description,
      modalImageId: row.modal_image_id,
      modalActionText: row.modal_action_text,
      modalActionUrl: row.modal_action_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async get(): Promise<UrgentAlert | null> {
    const row = await this.d1
      .prepare(
        `SELECT id, active, text, variant, starts_at, ends_at,
                has_modal, modal_button_text, modal_title, modal_description,
                modal_image_id, modal_action_text, modal_action_url,
                created_at, updated_at
         FROM urgent_alerts
         WHERE id = 'primary'
         LIMIT 1`,
      )
      .first<UrgentAlertRow>();

    if (!row) return null;
    return this.mapRowToEntity(row);
  }

  async getActive(): Promise<UrgentAlert | null> {
    const now = new Date().toISOString();
    const row = await this.d1
      .prepare(
        `SELECT id, active, text, variant, starts_at, ends_at,
                has_modal, modal_button_text, modal_title, modal_description,
                modal_image_id, modal_action_text, modal_action_url,
                created_at, updated_at
         FROM urgent_alerts
         WHERE id = 'primary'
           AND active = 1
           AND (starts_at IS NULL OR starts_at <= ?)
           AND (ends_at IS NULL OR ends_at >= ?)
         LIMIT 1`,
      )
      .bind(now, now)
      .first<UrgentAlertRow>();

    if (!row) return null;
    return this.mapRowToEntity(row);
  }

  async save(alert: UrgentAlert): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO urgent_alerts (
          id, active, text, variant, starts_at, ends_at,
          has_modal, modal_button_text, modal_title, modal_description,
          modal_image_id, modal_action_text, modal_action_url,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          active = excluded.active,
          text = excluded.text,
          variant = excluded.variant,
          starts_at = excluded.starts_at,
          ends_at = excluded.ends_at,
          has_modal = excluded.has_modal,
          modal_button_text = excluded.modal_button_text,
          modal_title = excluded.modal_title,
          modal_description = excluded.modal_description,
          modal_image_id = excluded.modal_image_id,
          modal_action_text = excluded.modal_action_text,
          modal_action_url = excluded.modal_action_url,
          updated_at = excluded.updated_at`,
      )
      .bind(
        'primary',
        alert.active ? 1 : 0,
        alert.text,
        alert.variant || 'alert',
        alert.startsAt || null,
        alert.endsAt || null,
        alert.hasModal ? 1 : 0,
        alert.modalButtonText || null,
        alert.modalTitle || null,
        alert.modalDescription || null,
        alert.modalImageId || null,
        alert.modalActionText || null,
        alert.modalActionUrl || null,
        new Date().toISOString(),
      )
      .run();
  }

  async delete(): Promise<void> {
    await this.d1
      .prepare(
        `UPDATE urgent_alerts SET
          active = 0,
          text = '',
          variant = 'alert',
          starts_at = NULL,
          ends_at = NULL,
          has_modal = 0,
          modal_button_text = NULL,
          modal_title = NULL,
          modal_description = NULL,
          modal_image_id = NULL,
          modal_action_text = NULL,
          modal_action_url = NULL,
          updated_at = ?
         WHERE id = 'primary'`,
      )
      .bind(new Date().toISOString())
      .run();
  }
}
