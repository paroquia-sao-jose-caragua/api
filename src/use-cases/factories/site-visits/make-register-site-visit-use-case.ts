import { D1SiteVisitsDAF } from '@/services/database/d1/d1-site-visits-daf';
import { RegisterSiteVisitUseCase } from '@/use-cases/site-visits/register-site-visit';

export function makeRegisterSiteVisitUseCase(c: DomainContext) {
  const siteVisitsDaf = new D1SiteVisitsDAF(c.env.DB);
  return new RegisterSiteVisitUseCase(siteVisitsDaf);
}
