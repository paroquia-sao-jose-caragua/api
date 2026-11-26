import type { SiteVisitStats } from '@/entities/site-visit';
import type { SiteVisitsDAF } from '@/services/database/site-visits-daf';
import { getSaoPauloDateString } from './register-site-visit';

export interface GetSiteVisitStatsRequest {
  days?: number;
  now?: Date;
}

export interface GetSiteVisitStatsResponse {
  stats: SiteVisitStats;
}

function subtractDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d - days));
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export class GetSiteVisitStatsUseCase {
  constructor(private siteVisitsDaf: SiteVisitsDAF) {}

  async execute(
    request: GetSiteVisitStatsRequest = {},
  ): Promise<GetSiteVisitStatsResponse> {
    const rawDays = request.days ?? 30;
    const periodDays = Math.min(90, Math.max(7, Math.floor(rawDays)));

    const today = getSaoPauloDateString(request.now ?? new Date());
    const last7DaysStart = subtractDays(today, 6);
    const periodStart = subtractDays(today, periodDays - 1);
    const monthStart = `${today.slice(0, 7)}-01`;

    const stats = await this.siteVisitsDaf.getStats({
      today,
      last7DaysStart,
      monthStart,
      periodStart,
      periodDays,
    });

    return { stats };
  }
}
