import { makeListAnnouncementsUseCase } from '@/use-cases/factories/announcements/make-list-announcements-use-case';

export const listAnnouncements: ControllerFn = async (c) => {
  const listUseCase = makeListAnnouncementsUseCase(c);
  const { announcements } = await listUseCase.execute();

  return c.json({ announcements });
};
