export type MassSchedule = {
  id: string;
  communityId: string;
  title?: string;
  type: 'ordinary' | 'devotional' | 'solemnity';
  orientations?: string;
  isPrecept: boolean;
  recurrenceType: 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  weekOfMonth?: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
  startTime: string; // "HH:MM"
};
