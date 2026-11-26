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

  it('aggregates unique visitors, total accesses, and per-page views accurately', async () => {
    // Visitor 1: enters / at 09:00, navigates to /liturgia at 09:02, returns to /agenda at 16:00
    await siteVisitsDaf.registerVisit({
      id: '1',
      visitDate: '2026-11-26',
      visitorHash: 'hash-1',
      deviceType: 'mobile',
      entryPath: '/',
      visitedAt: '2026-11-26T12:00:00.000Z',
      sessionWindowStart: '2026-11-26T11:45:00.000Z',
    });
    await siteVisitsDaf.registerVisit({
      id: '2',
      visitDate: '2026-11-26',
      visitorHash: 'hash-1',
      deviceType: 'mobile',
      entryPath: '/liturgia',
      visitedAt: '2026-11-26T12:02:00.000Z',
      sessionWindowStart: '2026-11-26T11:47:00.000Z',
    });
    await siteVisitsDaf.registerVisit({
      id: '3',
      visitDate: '2026-11-26',
      visitorHash: 'hash-1',
      deviceType: 'mobile',
      entryPath: '/agenda',
      visitedAt: '2026-11-26T19:00:00.000Z',
      sessionWindowStart: '2026-11-26T18:45:00.000Z',
    });

    // Visitor 2: enters /liturgia on same day
    await siteVisitsDaf.registerVisit({
      id: '4',
      visitDate: '2026-11-26',
      visitorHash: 'hash-2',
      deviceType: 'desktop',
      entryPath: '/liturgia',
      visitedAt: '2026-11-26T14:00:00.000Z',
      sessionWindowStart: '2026-11-26T13:45:00.000Z',
    });

    const { stats } = await sut.execute({
      days: 7,
      now: new Date('2026-11-26T20:00:00Z'),
    });

    expect(stats.todayCount).toBe(2); // 2 unique visitors
    expect(stats.todayAccessCount).toBe(3); // 3 sessions (2 from hash-1 + 1 from hash-2)
    expect(stats.todayPageViews).toBe(4); // 4 page views (/, /liturgia x2, /agenda)
    expect(stats.deviceBreakdown).toEqual({
      mobile: 2,
      desktop: 1,
      tablet: 0,
    });
    expect(stats.topPaths[0]).toEqual({ path: '/liturgia', count: 2 });
    expect(stats.dailySeries[stats.dailySeries.length - 1]).toEqual({
      date: '2026-11-26',
      count: 2,
      uniqueCount: 2,
      totalCount: 3,
      pageViews: 4,
    });
  });
});
