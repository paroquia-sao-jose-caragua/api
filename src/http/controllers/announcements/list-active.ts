import { makeListActiveAnnouncementsUseCase } from '@/use-cases/factories/announcements/make-list-active-announcements-use-case';

export const listActiveAnnouncements: ControllerFn = async (c) => {
  const listActiveUseCase = makeListActiveAnnouncementsUseCase(c);
  const { announcements } = await listActiveUseCase.execute();

  return c.json({ announcements });
};
