import { getAppContext } from '@/http/utils/getAppContext';
import { useReorderAnnouncementsSchema } from '@/schemas/use-announcement-schema';
import { makeReorderAnnouncementsUseCase } from '@/use-cases/factories/announcements/make-reorder-announcements-use-case';

export const reorderAnnouncements: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);

  const validationSchema = useReorderAnnouncementsSchema(t);
  const { orderedIds } = validationSchema.parse(inputs);

  const reorderUseCase = makeReorderAnnouncementsUseCase(c);
  await reorderUseCase.execute(orderedIds);

  return c.json({ message: 'Reordered' });
};
