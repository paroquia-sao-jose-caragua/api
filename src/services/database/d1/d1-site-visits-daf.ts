import type {
  DailyVisitCount,
  DeviceBreakdown,
  SiteVisitDeviceType,
  SiteVisitStats,
  TopEntryPath,
} from '@/entities/site-visit';
import type {
  GetSiteVisitStatsQuery,
  RegisterSiteVisitRecord,
  SiteVisitsDAF,
} from '../site-visits-daf';

interface VisitSummaryRow {
  unique_count: number;
  access_count: number;
}

interface PageViewsSummaryRow {
  page_views: number;
}

interface DailyVisitRow {
  visit_date: string;
  unique_count: number;
  access_count: number;
}

interface DailyPageViewsRow {
  visit_date: string;
  page_views: number;
}

interface DeviceRow {
  device_type: SiteVisitDeviceType;
  access_count: number;
}

interface PathRow {
  path: string;
  view_count: number;
}

function buildDateSeries(periodStart: string, periodDays: number): string[] {
  const dates: string[] = [];
  const [year, month, day] = periodStart.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, day));

  for (let i = 0; i < periodDays; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }

  return dates;
}

export class D1SiteVisitsDAF implements SiteVisitsDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  async registerVisit(
    data: RegisterSiteVisitRecord,
  ): Promise<{ inserted: boolean }> {
    const visitResult = await this.d1
      .prepare(
        `INSERT INTO site_visits
         (id, visit_date, visitor_hash, device_type, entry_path, visit_count, last_visit_at)
         VALUES (?, ?, ?, ?, ?, 1, ?)
         ON CONFLICT(visit_date, visitor_hash)
         DO UPDATE SET
           visit_count = visit_count + 1,
           last_visit_at = excluded.last_visit_at
         WHERE last_visit_at IS NULL OR last_visit_at <= ?`,
      )
      .bind(
        data.id,
        data.visitDate,
        data.visitorHash,
        data.deviceType,
        data.entryPath,
        data.visitedAt,
        data.sessionWindowStart,
      )
      .run();

    await this.d1
      .prepare(
        `INSERT INTO site_page_views (visit_date, path, view_count)
         VALUES (?, ?, 1)
         ON CONFLICT(visit_date, path)
         DO UPDATE SET view_count = view_count + 1`,
      )
      .bind(data.visitDate, data.entryPath)
      .run();

    const changes = visitResult.meta?.changes ?? 0;
    return { inserted: changes > 0 };
  }

  async getStats(query: GetSiteVisitStatsQuery): Promise<SiteVisitStats> {
    const [
      todayVisitsRes,
      last7VisitsRes,
      monthVisitsRes,
      totalVisitsRes,
      todayPvRes,
      last7PvRes,
      monthPvRes,
      totalPvRes,
      dailyVisitsRes,
      dailyPvRes,
      deviceRes,
      topPathsRes,
    ] = await Promise.all([
      this.d1
        .prepare(
          `SELECT COUNT(*) as unique_count, COALESCE(SUM(visit_count), 0) as access_count
           FROM site_visits WHERE visit_date = ?`,
        )
        .bind(query.today)
        .first<VisitSummaryRow>(),
      this.d1
        .prepare(
          `SELECT COUNT(*) as unique_count, COALESCE(SUM(visit_count), 0) as access_count
           FROM site_visits WHERE visit_date >= ? AND visit_date <= ?`,
        )
        .bind(query.last7DaysStart, query.today)
        .first<VisitSummaryRow>(),
      this.d1
        .prepare(
          `SELECT COUNT(*) as unique_count, COALESCE(SUM(visit_count), 0) as access_count
           FROM site_visits WHERE visit_date >= ? AND visit_date <= ?`,
        )
        .bind(query.monthStart, query.today)
        .first<VisitSummaryRow>(),
      this.d1
        .prepare(
          `SELECT COUNT(*) as unique_count, COALESCE(SUM(visit_count), 0) as access_count
           FROM site_visits`,
        )
        .first<VisitSummaryRow>(),
      this.d1
        .prepare(
          `SELECT COALESCE(SUM(view_count), 0) as page_views
           FROM site_page_views WHERE visit_date = ?`,
        )
        .bind(query.today)
        .first<PageViewsSummaryRow>(),
      this.d1
        .prepare(
          `SELECT COALESCE(SUM(view_count), 0) as page_views
           FROM site_page_views WHERE visit_date >= ? AND visit_date <= ?`,
        )
        .bind(query.last7DaysStart, query.today)
        .first<PageViewsSummaryRow>(),
      this.d1
        .prepare(
          `SELECT COALESCE(SUM(view_count), 0) as page_views
           FROM site_page_views WHERE visit_date >= ? AND visit_date <= ?`,
        )
        .bind(query.monthStart, query.today)
        .first<PageViewsSummaryRow>(),
      this.d1
        .prepare(
          `SELECT COALESCE(SUM(view_count), 0) as page_views FROM site_page_views`,
        )
        .first<PageViewsSummaryRow>(),
      this.d1
        .prepare(
          `SELECT visit_date, COUNT(*) as unique_count, COALESCE(SUM(visit_count), 0) as access_count
           FROM site_visits
           WHERE visit_date >= ? AND visit_date <= ?
           GROUP BY visit_date
           ORDER BY visit_date ASC`,
        )
        .bind(query.periodStart, query.today)
        .all<DailyVisitRow>(),
      this.d1
        .prepare(
          `SELECT visit_date, COALESCE(SUM(view_count), 0) as page_views
           FROM site_page_views
           WHERE visit_date >= ? AND visit_date <= ?
           GROUP BY visit_date
           ORDER BY visit_date ASC`,
        )
        .bind(query.periodStart, query.today)
        .all<DailyPageViewsRow>(),
      this.d1
        .prepare(
          `SELECT device_type, COALESCE(SUM(visit_count), 0) as access_count
           FROM site_visits
           WHERE visit_date >= ? AND visit_date <= ?
           GROUP BY device_type`,
        )
        .bind(query.periodStart, query.today)
        .all<DeviceRow>(),
      this.d1
        .prepare(
          `SELECT path, COALESCE(SUM(view_count), 0) as view_count
           FROM site_page_views
           WHERE visit_date >= ? AND visit_date <= ?
           GROUP BY path
           ORDER BY view_count DESC
           LIMIT 8`,
        )
        .bind(query.periodStart, query.today)
        .all<PathRow>(),
    ]);

    const dailyVisitsMap = new Map<string, { unique: number; access: number }>();
    for (const row of dailyVisitsRes.results || []) {
      dailyVisitsMap.set(row.visit_date, {
        unique: Number(row.unique_count) || 0,
        access: Number(row.access_count) || 0,
      });
    }

    const dailyPvMap = new Map<string, number>();
    for (const row of dailyPvRes.results || []) {
      dailyPvMap.set(row.visit_date, Number(row.page_views) || 0);
    }

    const dailySeries: DailyVisitCount[] = buildDateSeries(
      query.periodStart,
      query.periodDays,
    ).map((date) => {
      const v = dailyVisitsMap.get(date) ?? { unique: 0, access: 0 };
      const pv = dailyPvMap.get(date) ?? 0;
      return {
        date,
        count: v.unique,
        uniqueCount: v.unique,
        totalCount: v.access,
        pageViews: pv,
      };
    });

    const deviceBreakdown: DeviceBreakdown = {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    };
    for (const row of deviceRes.results || []) {
      if (row.device_type in deviceBreakdown) {
        deviceBreakdown[row.device_type] = Number(row.access_count) || 0;
      }
    }

    const topPaths: TopEntryPath[] = (topPathsRes.results || []).map((row) => ({
      path: row.path,
      count: Number(row.view_count) || 0,
    }));

    return {
      todayCount: Number(todayVisitsRes?.unique_count) || 0,
      last7DaysCount: Number(last7VisitsRes?.unique_count) || 0,
      currentMonthCount: Number(monthVisitsRes?.unique_count) || 0,
      totalCount: Number(totalVisitsRes?.unique_count) || 0,
      todayAccessCount: Number(todayVisitsRes?.access_count) || 0,
      last7DaysAccessCount: Number(last7VisitsRes?.access_count) || 0,
      currentMonthAccessCount: Number(monthVisitsRes?.access_count) || 0,
      totalAccessCount: Number(totalVisitsRes?.access_count) || 0,
      todayPageViews: Number(todayPvRes?.page_views) || 0,
      last7DaysPageViews: Number(last7PvRes?.page_views) || 0,
      currentMonthPageViews: Number(monthPvRes?.page_views) || 0,
      totalPageViews: Number(totalPvRes?.page_views) || 0,
      periodDays: query.periodDays,
      dailySeries,
      deviceBreakdown,
      topPaths,
    };
  }
}
