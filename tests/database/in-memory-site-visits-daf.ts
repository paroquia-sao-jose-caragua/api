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
  public pageViews: { visitDate: string; path: string; viewCount: number }[] = [];

  async registerVisit(
    data: RegisterSiteVisitRecord,
  ): Promise<{ inserted: boolean }> {
    const existing = this.items.find(
      (item) =>
        item.visitDate === data.visitDate &&
        item.visitorHash === data.visitorHash,
    );

    let inserted = false;

    if (!existing) {
      this.items.push({
        id: data.id,
        visitDate: data.visitDate,
        visitorHash: data.visitorHash,
        deviceType: data.deviceType,
        entryPath: data.entryPath,
        visitCount: 1,
        lastVisitAt: data.visitedAt,
        createdAt: data.visitedAt,
      });
      inserted = true;
    } else if (
      !existing.lastVisitAt ||
      existing.lastVisitAt <= data.sessionWindowStart
    ) {
      existing.visitCount += 1;
      existing.lastVisitAt = data.visitedAt;
      inserted = true;
    }

    const pv = this.pageViews.find(
      (p) => p.visitDate === data.visitDate && p.path === data.entryPath,
    );
    if (pv) {
      pv.viewCount += 1;
    } else {
      this.pageViews.push({
        visitDate: data.visitDate,
        path: data.entryPath,
        viewCount: 1,
      });
    }

    return { inserted };
  }

  async getStats(query: GetSiteVisitStatsQuery): Promise<SiteVisitStats> {
    const sumAccess = (list: SiteVisit[]) =>
      list.reduce((acc, item) => acc + item.visitCount, 0);
    const sumPv = (list: { viewCount: number }[]) =>
      list.reduce((acc, item) => acc + item.viewCount, 0);

    const todayItems = this.items.filter((i) => i.visitDate === query.today);
    const last7Items = this.items.filter(
      (i) => i.visitDate >= query.last7DaysStart && i.visitDate <= query.today,
    );
    const monthItems = this.items.filter(
      (i) => i.visitDate >= query.monthStart && i.visitDate <= query.today,
    );

    const todayPv = this.pageViews.filter((p) => p.visitDate === query.today);
    const last7Pv = this.pageViews.filter(
      (p) => p.visitDate >= query.last7DaysStart && p.visitDate <= query.today,
    );
    const monthPv = this.pageViews.filter(
      (p) => p.visitDate >= query.monthStart && p.visitDate <= query.today,
    );

    const inPeriod = this.items.filter(
      (i) => i.visitDate >= query.periodStart && i.visitDate <= query.today,
    );
    const pvInPeriod = this.pageViews.filter(
      (p) => p.visitDate >= query.periodStart && p.visitDate <= query.today,
    );

    const dailyVisitsMap = new Map<string, { unique: number; access: number }>();
    const deviceBreakdown: DeviceBreakdown = {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    };

    for (const item of inPeriod) {
      const curr = dailyVisitsMap.get(item.visitDate) ?? { unique: 0, access: 0 };
      curr.unique += 1;
      curr.access += item.visitCount;
      dailyVisitsMap.set(item.visitDate, curr);
      deviceBreakdown[item.deviceType] += item.visitCount;
    }

    const dailyPvMap = new Map<string, number>();
    const pathMap = new Map<string, number>();
    for (const pv of pvInPeriod) {
      dailyPvMap.set(pv.visitDate, (dailyPvMap.get(pv.visitDate) ?? 0) + pv.viewCount);
      pathMap.set(pv.path, (pathMap.get(pv.path) ?? 0) + pv.viewCount);
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

    const topPaths: TopEntryPath[] = Array.from(pathMap.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      todayCount: todayItems.length,
      last7DaysCount: last7Items.length,
      currentMonthCount: monthItems.length,
      totalCount: this.items.length,
      todayAccessCount: sumAccess(todayItems),
      last7DaysAccessCount: sumAccess(last7Items),
      currentMonthAccessCount: sumAccess(monthItems),
      totalAccessCount: sumAccess(this.items),
      todayPageViews: sumPv(todayPv),
      last7DaysPageViews: sumPv(last7Pv),
      currentMonthPageViews: sumPv(monthPv),
      totalPageViews: sumPv(this.pageViews),
      periodDays: query.periodDays,
      dailySeries,
      deviceBreakdown,
      topPaths,
    };
  }
}
