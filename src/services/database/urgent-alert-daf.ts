import type { UrgentAlert } from '@/entities/urgent-alert';

export interface UrgentAlertDAF {
  get(): Promise<UrgentAlert | null>;
  getActive(): Promise<UrgentAlert | null>;
  save(alert: UrgentAlert): Promise<void>;
  delete(): Promise<void>;
}
