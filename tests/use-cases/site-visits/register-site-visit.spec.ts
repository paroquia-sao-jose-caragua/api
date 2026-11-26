import { beforeEach, describe, expect, it } from 'vitest';
import { InMemorySiteVisitsDAF } from '../../database/in-memory-site-visits-daf';
import { RegisterSiteVisitUseCase } from '@/use-cases/site-visits/register-site-visit';

let siteVisitsDaf: InMemorySiteVisitsDAF;
let sut: RegisterSiteVisitUseCase;

const HUMAN_MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const HUMAN_DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const GOOGLEBOT_UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

describe('Register Site Visit Use Case', () => {
  beforeEach(() => {
    siteVisitsDaf = new InMemorySiteVisitsDAF();
    sut = new RegisterSiteVisitUseCase(siteVisitsDaf);
  });

  it('tracks page views across navigation in same session without duplicating session or unique visitor', async () => {
    const t1 = new Date('2026-11-26T12:00:00Z'); // 09:00 BRT
    const t2 = new Date('2026-11-26T12:02:00Z'); // 09:02 BRT (same session)

    const first = await sut.execute({
      ip: '177.12.34.56',
      userAgent: HUMAN_MOBILE_UA,
      entryPath: '/?ref=whatsapp',
      salt: 'test-salt',
      now: t1,
    });

    const secondPage = await sut.execute({
      ip: '177.12.34.56',
      userAgent: HUMAN_MOBILE_UA,
      entryPath: '/liturgia',
      salt: 'test-salt',
      now: t2,
    });

    expect(first.registered).toBe(true);
    expect(secondPage.registered).toBe(false); // same session (< 15 min)
    expect(siteVisitsDaf.items).toHaveLength(1);
    expect(siteVisitsDaf.items[0].visitCount).toBe(1);
    expect(siteVisitsDaf.pageViews).toEqual([
      { visitDate: '2026-11-26', path: '/', viewCount: 1 },
      { visitDate: '2026-11-26', path: '/liturgia', viewCount: 1 },
    ]);
  });

  it('increments total access count when same visitor returns after 15+ minutes on the same day', async () => {
    const morning = new Date('2026-11-26T12:00:00Z'); // 09:00 BRT
    const afternoon = new Date('2026-11-26T19:00:00Z'); // 16:00 BRT

    await sut.execute({
      ip: '177.12.34.56',
      userAgent: HUMAN_MOBILE_UA,
      entryPath: '/liturgia',
      salt: 'test-salt',
      now: morning,
    });

    const returnVisit = await sut.execute({
      ip: '177.12.34.56',
      userAgent: HUMAN_MOBILE_UA,
      entryPath: '/agenda',
      salt: 'test-salt',
      now: afternoon,
    });

    expect(returnVisit.registered).toBe(true);
    expect(siteVisitsDaf.items).toHaveLength(1); // still 1 unique visitor
    expect(siteVisitsDaf.items[0].visitCount).toBe(2); // 2 total accesses
    expect(siteVisitsDaf.pageViews).toHaveLength(2);
  });

  it('ignores known bots and empty user agents', async () => {
    const botRes = await sut.execute({
      ip: '66.249.66.1',
      userAgent: GOOGLEBOT_UA,
      entryPath: '/',
      salt: 'test-salt',
    });

    const emptyUaRes = await sut.execute({
      ip: '177.12.34.56',
      userAgent: '',
      entryPath: '/',
      salt: 'test-salt',
    });

    expect(botRes.ignoredAsBot).toBe(true);
    expect(emptyUaRes.ignoredAsBot).toBe(true);
    expect(siteVisitsDaf.items).toHaveLength(0);
    expect(siteVisitsDaf.pageViews).toHaveLength(0);
  });

  it('counts the same visitor as a new unique visitor on a different day', async () => {
    await sut.execute({
      ip: '177.12.34.56',
      userAgent: HUMAN_DESKTOP_UA,
      entryPath: '/',
      salt: 'test-salt',
      now: new Date('2026-11-25T15:00:00Z'),
    });

    const nextDay = await sut.execute({
      ip: '177.12.34.56',
      userAgent: HUMAN_DESKTOP_UA,
      entryPath: '/liturgia/',
      salt: 'test-salt',
      now: new Date('2026-11-26T15:00:00Z'),
    });

    expect(nextDay.registered).toBe(true);
    expect(siteVisitsDaf.items).toHaveLength(2);
    expect(siteVisitsDaf.items[1].entryPath).toBe('/liturgia');
  });
});
