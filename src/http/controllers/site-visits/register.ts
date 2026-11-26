import { getAppContext } from '@/http/utils/getAppContext';
import { useRegisterSiteVisitSchema } from '@/schemas/use-site-visit-schema';
import { makeRegisterSiteVisitUseCase } from '@/use-cases/factories/site-visits/make-register-site-visit-use-case';

export const registerSiteVisit: ControllerFn = async (c) => {
  const { inputs } = getAppContext(c);

  const parsed = useRegisterSiteVisitSchema().safeParse(inputs || {});
  const entryPath = parsed.success ? parsed.data.entryPath : '/';

  const ip =
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  const userAgent = c.req.header('user-agent') || '';

  const registerUseCase = makeRegisterSiteVisitUseCase(c);
  const { registered } = await registerUseCase.execute({
    ip,
    userAgent,
    entryPath,
    salt: c.env.SIGNING_SECRET,
  });

  if (registered) {
    return c.json({ registered: true }, 201);
  }

  return c.body(null, 204);
};
