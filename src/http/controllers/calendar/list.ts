import { getAppContext } from '@/http/utils/getAppContext';
import { useListCalendarQueriesSchema } from '@/schemas/use-list-calendar-queries-schema';
import { makeListCalendarUseCase } from '@/use-cases/factories/calendar/make-list-calendar-use-case';

export const listCalendar = async (c: DomainContext) => {
  const { t, queries } = getAppContext(c);

  const { month, year } = useListCalendarQueriesSchema(t).parse(queries);

  const useCase = makeListCalendarUseCase(c);

  const { calendar } = await useCase.execute({ month, year });

  return c.json({ calendar });
};
