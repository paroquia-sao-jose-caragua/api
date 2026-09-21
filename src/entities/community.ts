import type { MassSchedule } from './mass-schedule';

export type Community = {
  id: string;
  name: string;
  slug: string;
  type: 'chapel' | 'parish_church';
  address: string;
  coverId: string;
  createdAt: string;
  updatedAt?: string;
  massSchedules?: MassSchedule[];
};
