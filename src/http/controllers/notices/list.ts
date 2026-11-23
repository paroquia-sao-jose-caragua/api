import { makeListNoticesUseCase } from '@/use-cases/factories/notices/make-list-notices-use-case';

export const listNotices: ControllerFn = async (c) => {
  const listUseCase = makeListNoticesUseCase(c);
  const { notices } = await listUseCase.execute();

  return c.json({ notices });
};
