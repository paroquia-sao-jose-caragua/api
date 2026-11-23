import { makeListActiveNoticesUseCase } from '@/use-cases/factories/notices/make-list-active-notices-use-case';

export const listActiveNotices: ControllerFn = async (c) => {
  const listActiveUseCase = makeListActiveNoticesUseCase(c);
  const { notices } = await listActiveUseCase.execute();

  return c.json({ notices });
};
