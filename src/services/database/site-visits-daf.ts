import type {
  SiteVisit,
  SiteVisitStats,
} from '@/entities/site-visit';

export interface RegisterSiteVisitRecord {
  id: string;
  visitDate: string;
  visitorHash: string;
  deviceType: SiteVisit['deviceType'];
  entryPath: string;
  visitedAt: string;
  sessionWindowStart: string;
}

export interface GetSiteVisitStatsQuery {
  today: string;
  last7DaysStart: string;
  monthStart: string;
  periodStart: string;
  periodDays: number;
}

export interface SiteVisitsDAF {
  registerVisit(
    data: RegisterSiteVisitRecord,
  ): Promise<{ inserted: boolean }>;
  getStats(query: GetSiteVisitStatsQuery): Promise<SiteVisitStats>;
}
