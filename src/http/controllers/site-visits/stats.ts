import { getAppContext } from '@/http/utils/getAppContext';
import { useGetSiteVisitStatsQuerySchema } from '@/schemas/use-site-visit-schema';
import { makeGetSiteVisitStatsUseCase } from '@/use-cases/factories/site-visits/make-get-site-visit-stats-use-case';

const ALLOWED_ROLES = new Set(['admin', 'secretary', 'user']);

export const getSiteVisitStats: ControllerFn = async (c) => {
  const { t } = getAppContext(c);
  const user = c.get('user');

  if (!user || !ALLOWED_ROLES.has(user.role)) {
    return c.json({ message: t('unauthorized') }, 403);
  }

  const parsed = useGetSiteVisitStatsQuerySchema().safeParse({
    days: c.req.query('days'),
  });
  const days = parsed.success ? parsed.data.days : 30;

  const getStatsUseCase = makeGetSiteVisitStatsUseCase(c);
  const { stats } = await getStatsUseCase.execute({ days });

  return c.json({ stats }, 200);
};
