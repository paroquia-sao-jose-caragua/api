import type { CommunityPhoto } from './community-photo';
import type { MassSchedule } from './mass-schedule';

export type Community = {
  id: string;
  name: string;
  slug: string;
  type: 'chapel' | 'parish_church';
  address: string;
  coverId: string;
  coverUrl?: string;
  heroSubtitle?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  historySummary?: string;
  patronName?: string;
  patronDescription?: string;
  patronPhotoId?: string;
  patronPhotoUrl?: string;
  phone?: string;
  email?: string;
  officeHours?: string;
  photos?: CommunityPhoto[];
  massSchedules?: MassSchedule[];
  createdAt: string;
  updatedAt?: string;
};
