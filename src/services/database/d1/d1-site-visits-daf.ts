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

interface CountRow {
  count: number;
}

interface DailyRow {
  visit_date: string;
  count: number;
}

interface DeviceRow {
  device_type: SiteVisitDeviceType;
  count: number;
}

interface PathRow {
  entry_path: string;
  count: number;
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
    const result = await this.d1
      .prepare(
        `INSERT OR IGNORE INTO site_visits
         (id, visit_date, visitor_hash, device_type, entry_path)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(
        data.id,
        data.visitDate,
        data.visitorHash,
        data.deviceType,
        data.entryPath,
      )
      .run();

    const changes = result.meta?.changes ?? 0;
    return { inserted: changes > 0 };
  }

  async getStats(query: GetSiteVisitStatsQuery): Promise<SiteVisitStats> {
    const [
      todayRes,
      last7Res,
      monthRes,
      totalRes,
      dailyRes,
      deviceRes,
      topPathsRes,
    ] = await Promise.all([
      this.d1
        .prepare(`SELECT COUNT(*) as count FROM site_visits WHERE visit_date = ?`)
        .bind(query.today)
        .first<CountRow>(),
      this.d1
        .prepare(
          `SELECT COUNT(*) as count FROM site_visits WHERE visit_date >= ? AND visit_date <= ?`,
        )
        .bind(query.last7DaysStart, query.today)
        .first<CountRow>(),
      this.d1
        .prepare(
          `SELECT COUNT(*) as count FROM site_visits WHERE visit_date >= ? AND visit_date <= ?`,
        )
        .bind(query.monthStart, query.today)
        .first<CountRow>(),
      this.d1
        .prepare(`SELECT COUNT(*) as count FROM site_visits`)
        .first<CountRow>(),
      this.d1
        .prepare(
          `SELECT visit_date, COUNT(*) as count
           FROM site_visits
           WHERE visit_date >= ? AND visit_date <= ?
           GROUP BY visit_date
           ORDER BY visit_date ASC`,
        )
        .bind(query.periodStart, query.today)
        .all<DailyRow>(),
      this.d1
        .prepare(
          `SELECT device_type, COUNT(*) as count
           FROM site_visits
           WHERE visit_date >= ? AND visit_date <= ?
           GROUP BY device_type`,
        )
        .bind(query.periodStart, query.today)
        .all<DeviceRow>(),
      this.d1
        .prepare(
          `SELECT entry_path, COUNT(*) as count
           FROM site_visits
           WHERE visit_date >= ? AND visit_date <= ?
           GROUP BY entry_path
           ORDER BY count DESC
           LIMIT 8`,
        )
        .bind(query.periodStart, query.today)
        .all<PathRow>(),
    ]);

    const dailyMap = new Map<string, number>();
    for (const row of dailyRes.results || []) {
      dailyMap.set(row.visit_date, Number(row.count) || 0);
    }

    const dailySeries: DailyVisitCount[] = buildDateSeries(
      query.periodStart,
      query.periodDays,
    ).map((date) => ({
      date,
      count: dailyMap.get(date) ?? 0,
    }));

    const deviceBreakdown: DeviceBreakdown = {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    };
    for (const row of deviceRes.results || []) {
      if (row.device_type in deviceBreakdown) {
        deviceBreakdown[row.device_type] = Number(row.count) || 0;
      }
    }

    const topPaths: TopEntryPath[] = (topPathsRes.results || []).map((row) => ({
      path: row.entry_path,
      count: Number(row.count) || 0,
    }));

    return {
      todayCount: Number(todayRes?.count) || 0,
      last7DaysCount: Number(last7Res?.count) || 0,
      currentMonthCount: Number(monthRes?.count) || 0,
      totalCount: Number(totalRes?.count) || 0,
      periodDays: query.periodDays,
      dailySeries,
      deviceBreakdown,
      topPaths,
    };
  }
}
