export type SiteVisitDeviceType = 'mobile' | 'desktop' | 'tablet';

export interface SiteVisit {
  id: string;
  visitDate: string; // YYYY-MM-DD (America/Sao_Paulo)
  visitorHash: string; // Anonymous SHA-256 hash
  deviceType: SiteVisitDeviceType;
  entryPath: string;
  createdAt: string;
}

export interface DailyVisitCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface TopEntryPath {
  path: string;
  count: number;
}

export interface DeviceBreakdown {
  mobile: number;
  desktop: number;
  tablet: number;
}

export interface SiteVisitStats {
  todayCount: number;
  last7DaysCount: number;
  currentMonthCount: number;
  totalCount: number;
  periodDays: number;
  dailySeries: DailyVisitCount[];
  deviceBreakdown: DeviceBreakdown;
  topPaths: TopEntryPath[];
}
