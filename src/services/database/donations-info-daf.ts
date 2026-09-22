import type { DonationsInfo } from '@/entities/donations-info';

export interface DonationsInfoDAF {
  get(): Promise<DonationsInfo | null>;
  save(donations: DonationsInfo): Promise<void>;
}
