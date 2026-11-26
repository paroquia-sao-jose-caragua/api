import { beforeEach, describe, expect, it } from 'vitest';
import { InMemorySiteVisitsDAF } from '../../database/in-memory-site-visits-daf';
import { GetSiteVisitStatsUseCase } from '@/use-cases/site-visits/get-site-visit-stats';

let siteVisitsDaf: InMemorySiteVisitsDAF;
let sut: GetSiteVisitStatsUseCase;

describe('Get Site Visit Stats Use Case', () => {
  beforeEach(() => {
    siteVisitsDaf = new InMemorySiteVisitsDAF();
    sut = new GetSiteVisitStatsUseCase(siteVisitsDaf);
  });

  it('should aggregate today, 7d, month, total, daily series, devices, and top paths', async () => {
    await siteVisitsDaf.registerVisit({
      id: '1',
      visitDate: '2026-11-26',
      visitorHash: 'hash-1',
      deviceType: 'mobile',
      entryPath: '/',
    });
    await siteVisitsDaf.registerVisit({
      id: '2',
      visitDate: '2026-11-26',
      visitorHash: 'hash-2',
      deviceType: 'desktop',
      entryPath: '/agendamentos',
    });
    await siteVisitsDaf.registerVisit({
      id: '3',
      visitDate: '2026-11-24',
      visitorHash: 'hash-3',
      deviceType: 'mobile',
      entryPath: '/agendamentos',
    });
    await siteVisitsDaf.registerVisit({
      id: '4',
      visitDate: '2026-11-05',
      visitorHash: 'hash-4',
      deviceType: 'tablet',
      entryPath: '/agenda',
    });
    await siteVisitsDaf.registerVisit({
      id: '5',
      visitDate: '2026-10-15',
      visitorHash: 'hash-5',
      deviceType: 'desktop',
      entryPath: '/liturgia',
    });

    const { stats } = await sut.execute({
      days: 7,
      now: new Date('2026-11-26T15:00:00Z'),
    });

    expect(stats.todayCount).toBe(2);
    expect(stats.last7DaysCount).toBe(3);
    expect(stats.currentMonthCount).toBe(4);
    expect(stats.totalCount).toBe(5);
    expect(stats.dailySeries).toHaveLength(7);
    expect(stats.dailySeries[stats.dailySeries.length - 1]).toEqual({
      date: '2026-11-26',
      count: 2,
    });
    expect(stats.deviceBreakdown).toEqual({
      mobile: 2,
      desktop: 1,
      tablet: 0,
    });
    expect(stats.topPaths[0]).toEqual({ path: '/agendamentos', count: 2 });
  });
});
