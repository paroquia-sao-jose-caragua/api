import { getAppContext } from '@/http/utils/getAppContext';
import { useListCalendarQueriesSchema } from '@/schemas/use-list-calendar-queries-schema';
import { makeListCalendarUseCase } from '@/use-cases/factories/calendar/make-list-calendar-use-case';

export const listCalendar = async (c: DomainContext) => {
  const { t, queries } = getAppContext(c);

  const { month, year, communityId } =
    useListCalendarQueriesSchema(t).parse(queries);

  const useCase = makeListCalendarUseCase(c);

  const { calendar } = await useCase.execute({ month, year, communityId });

  return c.json({
    calendar: calendar.map((item) => ({
      ...item,
      schedules: {
        active: item.schedules.active.map((schedule) => ({
          ...schedule,
          community: {
            ...schedule.community,
            coverUrl: c.env.S3_API_URL.concat('/', schedule.community.coverId),
          },
        })),
        exceptions: item.schedules.exceptions.map((schedule) => ({
          ...schedule,
          community: {
            ...schedule.community,
            coverUrl: c.env.S3_API_URL.concat('/', schedule.community.coverId),
          },
        })),
      },
    })),
  });
};
