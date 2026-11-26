import type {
  DailyVisitCount,
  DeviceBreakdown,
  SiteVisit,
  SiteVisitStats,
  TopEntryPath,
} from '@/entities/site-visit';
import type {
  GetSiteVisitStatsQuery,
  RegisterSiteVisitRecord,
  SiteVisitsDAF,
} from '@/services/database/site-visits-daf';

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

export class InMemorySiteVisitsDAF implements SiteVisitsDAF {
  public items: SiteVisit[] = [];

  async registerVisit(
    data: RegisterSiteVisitRecord,
  ): Promise<{ inserted: boolean }> {
    const exists = this.items.some(
      (item) =>
        item.visitDate === data.visitDate &&
        item.visitorHash === data.visitorHash,
    );

    if (exists) {
      return { inserted: false };
    }

    this.items.push({
      ...data,
      createdAt: new Date().toISOString(),
    });

    return { inserted: true };
  }

  async getStats(query: GetSiteVisitStatsQuery): Promise<SiteVisitStats> {
    const todayCount = this.items.filter(
      (item) => item.visitDate === query.today,
    ).length;

    const last7DaysCount = this.items.filter(
      (item) =>
        item.visitDate >= query.last7DaysStart &&
        item.visitDate <= query.today,
    ).length;

    const currentMonthCount = this.items.filter(
      (item) =>
        item.visitDate >= query.monthStart && item.visitDate <= query.today,
    ).length;

    const totalCount = this.items.length;

    const inPeriod = this.items.filter(
      (item) =>
        item.visitDate >= query.periodStart && item.visitDate <= query.today,
    );

    const dailyMap = new Map<string, number>();
    const deviceBreakdown: DeviceBreakdown = {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    };
    const pathMap = new Map<string, number>();

    for (const item of inPeriod) {
      dailyMap.set(item.visitDate, (dailyMap.get(item.visitDate) ?? 0) + 1);
      deviceBreakdown[item.deviceType] += 1;
      pathMap.set(item.entryPath, (pathMap.get(item.entryPath) ?? 0) + 1);
    }

    const dailySeries: DailyVisitCount[] = buildDateSeries(
      query.periodStart,
      query.periodDays,
    ).map((date) => ({
      date,
      count: dailyMap.get(date) ?? 0,
    }));

    const topPaths: TopEntryPath[] = Array.from(pathMap.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      todayCount,
      last7DaysCount,
      currentMonthCount,
      totalCount,
      periodDays: query.periodDays,
      dailySeries,
      deviceBreakdown,
      topPaths,
    };
  }
}
