export type SiteVisitDeviceType = 'mobile' | 'desktop' | 'tablet';

export interface SiteVisit {
  id: string;
  visitDate: string; // YYYY-MM-DD (America/Sao_Paulo)
  visitorHash: string; // Anonymous SHA-256 hash
  deviceType: SiteVisitDeviceType;
  entryPath: string;
  visitCount: number;
  lastVisitAt: string;
  createdAt: string;
}

export interface DailyVisitCount {
  date: string; // YYYY-MM-DD
  count: number; // unique visitors (backwards-compatible)
  uniqueCount: number;
  totalCount: number; // total sessions / accesses
  pageViews: number;
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
  todayAccessCount: number;
  last7DaysAccessCount: number;
  currentMonthAccessCount: number;
  totalAccessCount: number;
  todayPageViews: number;
  last7DaysPageViews: number;
  currentMonthPageViews: number;
  totalPageViews: number;
  periodDays: number;
  dailySeries: DailyVisitCount[];
  deviceBreakdown: DeviceBreakdown;
  topPaths: TopEntryPath[];
}
