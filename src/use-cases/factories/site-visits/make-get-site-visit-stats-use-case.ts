import { D1SiteVisitsDAF } from '@/services/database/d1/d1-site-visits-daf';
import { GetSiteVisitStatsUseCase } from '@/use-cases/site-visits/get-site-visit-stats';

export function makeGetSiteVisitStatsUseCase(c: DomainContext) {
  const siteVisitsDaf = new D1SiteVisitsDAF(c.env.DB);
  return new GetSiteVisitStatsUseCase(siteVisitsDaf);
}
