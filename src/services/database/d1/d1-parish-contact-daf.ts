import type { ParishContact } from '@/entities/parish-contact';
import type { ParishContactDAF } from '../parish-contact-daf';

type ParishContactRow = {
  id: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  office_hours: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  facebook_url: string | null;
  whatsapp_url: string | null;
  updated_at: string | null;
  created_at: string;
};

function mapRowToParishContact(row: ParishContactRow): ParishContact {
  return {
    id: row.id,
    phone: row.phone ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    email: row.email ?? undefined,
    address: row.address ?? undefined,
    officeHours: row.office_hours ?? undefined,
    instagramUrl: row.instagram_url ?? undefined,
    youtubeUrl: row.youtube_url ?? undefined,
    facebookUrl: row.facebook_url ?? undefined,
    whatsappUrl: row.whatsapp_url ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    createdAt: row.created_at,
  };
}

export class D1ParishContactDAF implements ParishContactDAF {
  constructor(private d1: D1Database) {}

  async get(): Promise<ParishContact | null> {
    const row = await this.d1
      .prepare(
        `SELECT id, phone, whatsapp, email, address, office_hours,
                instagram_url, youtube_url, facebook_url, whatsapp_url,
                updated_at, created_at
         FROM parish_contact
         ORDER BY created_at ASC
         LIMIT 1`,
      )
      .first<ParishContactRow>();

    if (!row) {
      return null;
    }

    return mapRowToParishContact(row);
  }

  async save(data: {
    id: string;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    address?: string | null;
    officeHours?: string | null;
    instagramUrl?: string | null;
    youtubeUrl?: string | null;
    facebookUrl?: string | null;
    whatsappUrl?: string | null;
    updatedAt: string;
    createdAt?: string;
  }): Promise<ParishContact> {
    const existing = await this.get();

    if (existing) {
      await this.d1
        .prepare(
          `UPDATE parish_contact
           SET phone = ?,
               whatsapp = ?,
               email = ?,
               address = ?,
               office_hours = ?,
               instagram_url = ?,
               youtube_url = ?,
               facebook_url = ?,
               whatsapp_url = ?,
               updated_at = ?
           WHERE id = ?`,
        )
        .bind(
          data.phone ?? null,
          data.whatsapp ?? null,
          data.email ?? null,
          data.address ?? null,
          data.officeHours ?? null,
          data.instagramUrl ?? null,
          data.youtubeUrl ?? null,
          data.facebookUrl ?? null,
          data.whatsappUrl ?? null,
          data.updatedAt,
          existing.id,
        )
        .run();

      const updated = await this.d1
        .prepare(
          `SELECT id, phone, whatsapp, email, address, office_hours,
                  instagram_url, youtube_url, facebook_url, whatsapp_url,
                  updated_at, created_at
           FROM parish_contact
           WHERE id = ?`,
        )
        .bind(existing.id)
        .first<ParishContactRow>();

      return mapRowToParishContact(updated!);
    }

    const id = data.id || 'primary';
    const createdAt = data.createdAt || new Date().toISOString();

    await this.d1
      .prepare(
        `INSERT INTO parish_contact (
          id, phone, whatsapp, email, address, office_hours,
          instagram_url, youtube_url, facebook_url, whatsapp_url,
          updated_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        data.phone ?? null,
        data.whatsapp ?? null,
        data.email ?? null,
        data.address ?? null,
        data.officeHours ?? null,
        data.instagramUrl ?? null,
        data.youtubeUrl ?? null,
        data.facebookUrl ?? null,
        data.whatsappUrl ?? null,
        data.updatedAt,
        createdAt,
      )
      .run();

    return {
      id,
      phone: data.phone ?? undefined,
      whatsapp: data.whatsapp ?? undefined,
      email: data.email ?? undefined,
      address: data.address ?? undefined,
      officeHours: data.officeHours ?? undefined,
      instagramUrl: data.instagramUrl ?? undefined,
      youtubeUrl: data.youtubeUrl ?? undefined,
      facebookUrl: data.facebookUrl ?? undefined,
      whatsappUrl: data.whatsappUrl ?? undefined,
      updatedAt: data.updatedAt,
      createdAt,
    };
  }
}
