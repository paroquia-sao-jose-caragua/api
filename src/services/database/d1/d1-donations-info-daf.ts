import type { DonationsInfo } from '@/entities/donations-info';
import type { DonationsInfoDAF } from '../donations-info-daf';

interface DonationsInfoRow {
  id: string;
  pix_key: string | null;
  pix_key_type: string | null;
  pix_receiver_name: string | null;
  pix_receiver_city: string | null;
  bank_name: string | null;
  bank_agency: string | null;
  bank_account: string | null;
  bank_account_type: string | null;
  bank_cnpj: string | null;
  bank_beneficiary: string | null;
  receipt_whatsapp: string | null;
  receipt_whatsapp_url: string | null;
  receipt_email: string | null;
  title: string | null;
  description: string | null;
  pastoral_center_title: string | null;
  pastoral_center_description: string | null;
  created_at: string;
  updated_at: string | null;
}

export class D1DonationsInfoDAF implements DonationsInfoDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  private mapRowToEntity(row: DonationsInfoRow): DonationsInfo {
    return {
      id: row.id,
      pixKey: row.pix_key,
      pixKeyType: row.pix_key_type,
      pixReceiverName: row.pix_receiver_name,
      pixReceiverCity: row.pix_receiver_city,
      bankName: row.bank_name,
      bankAgency: row.bank_agency,
      bankAccount: row.bank_account,
      bankAccountType: row.bank_account_type,
      bankCnpj: row.bank_cnpj,
      bankBeneficiary: row.bank_beneficiary,
      receiptWhatsapp: row.receipt_whatsapp,
      receiptWhatsappUrl: row.receipt_whatsapp_url,
      receiptEmail: row.receipt_email,
      title: row.title,
      description: row.description,
      pastoralCenterTitle: row.pastoral_center_title,
      pastoralCenterDescription: row.pastoral_center_description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async get(): Promise<DonationsInfo | null> {
    const row = await this.d1
      .prepare(
        `SELECT id, pix_key, pix_key_type, pix_receiver_name, pix_receiver_city,
                bank_name, bank_agency, bank_account, bank_account_type, bank_cnpj, bank_beneficiary,
                receipt_whatsapp, receipt_whatsapp_url, receipt_email,
                title, description, pastoral_center_title, pastoral_center_description,
                created_at, updated_at
         FROM donations_info
         WHERE id = 'primary'
         LIMIT 1`,
      )
      .first<DonationsInfoRow>();

    if (!row) {
      return null;
    }

    return this.mapRowToEntity(row);
  }

  async save(donations: DonationsInfo): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO donations_info (
          id, pix_key, pix_key_type, pix_receiver_name, pix_receiver_city,
          bank_name, bank_agency, bank_account, bank_account_type, bank_cnpj, bank_beneficiary,
          receipt_whatsapp, receipt_whatsapp_url, receipt_email,
          title, description, pastoral_center_title, pastoral_center_description,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          pix_key = excluded.pix_key,
          pix_key_type = excluded.pix_key_type,
          pix_receiver_name = excluded.pix_receiver_name,
          pix_receiver_city = excluded.pix_receiver_city,
          bank_name = excluded.bank_name,
          bank_agency = excluded.bank_agency,
          bank_account = excluded.bank_account,
          bank_account_type = excluded.bank_account_type,
          bank_cnpj = excluded.bank_cnpj,
          bank_beneficiary = excluded.bank_beneficiary,
          receipt_whatsapp = excluded.receipt_whatsapp,
          receipt_whatsapp_url = excluded.receipt_whatsapp_url,
          receipt_email = excluded.receipt_email,
          title = excluded.title,
          description = excluded.description,
          pastoral_center_title = excluded.pastoral_center_title,
          pastoral_center_description = excluded.pastoral_center_description,
          updated_at = excluded.updated_at`,
      )
      .bind(
        'primary',
        donations.pixKey || null,
        donations.pixKeyType || 'phone',
        donations.pixReceiverName || null,
        donations.pixReceiverCity || null,
        donations.bankName || null,
        donations.bankAgency || null,
        donations.bankAccount || null,
        donations.bankAccountType || 'Conta Corrente',
        donations.bankCnpj || null,
        donations.bankBeneficiary || null,
        donations.receiptWhatsapp || null,
        donations.receiptWhatsappUrl || null,
        donations.receiptEmail || null,
        donations.title || null,
        donations.description || null,
        donations.pastoralCenterTitle || null,
        donations.pastoralCenterDescription || null,
        new Date().toISOString(),
      )
      .run();
  }
}
