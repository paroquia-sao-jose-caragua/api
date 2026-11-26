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

  it('should register a unique human visit and deduplicate same visitor on the same day', async () => {
    const fixedDate = new Date('2026-11-26T15:00:00Z');

    const first = await sut.execute({
      ip: '177.12.34.56',
      userAgent: HUMAN_MOBILE_UA,
      entryPath: '/agendamentos?ref=whatsapp',
      salt: 'test-salt',
      now: fixedDate,
    });

    const duplicate = await sut.execute({
      ip: '177.12.34.56',
      userAgent: HUMAN_MOBILE_UA,
      entryPath: '/agenda',
      salt: 'test-salt',
      now: fixedDate,
    });

    expect(first.registered).toBe(true);
    expect(first.ignoredAsBot).toBe(false);
    expect(duplicate.registered).toBe(false);
    expect(duplicate.ignoredAsBot).toBe(false);
    expect(siteVisitsDaf.items).toHaveLength(1);
    expect(siteVisitsDaf.items[0].deviceType).toBe('mobile');
    expect(siteVisitsDaf.items[0].entryPath).toBe('/agendamentos');
    expect(siteVisitsDaf.items[0].visitorHash).not.toContain('177.12.34.56');
  });

  it('should ignore known bots and empty user agents', async () => {
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

    expect(botRes.registered).toBe(false);
    expect(botRes.ignoredAsBot).toBe(true);
    expect(emptyUaRes.registered).toBe(false);
    expect(emptyUaRes.ignoredAsBot).toBe(true);
    expect(siteVisitsDaf.items).toHaveLength(0);
  });

  it('should count the same visitor again on a different day', async () => {
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
    expect(siteVisitsDaf.items[1].deviceType).toBe('desktop');
  });
});
