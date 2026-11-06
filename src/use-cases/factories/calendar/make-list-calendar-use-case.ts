import { D1CommunitiesDAF } from '@/services/database/d1/d1-communities-daf';
import { D1EventSchedulesDAF } from '@/services/database/d1/d1-event-schedules-daf';
import { D1MassScheduleExceptionsDAF } from '@/services/database/d1/d1-mass-schedule-exceptions-daf';
import { D1MassSchedulesDAF } from '@/services/database/d1/d1-mass-schedules-daf';
import { ListCalendarUseCase } from '@/use-cases/calendar/list-calendar';

export function makeListCalendarUseCase(c: DomainContext) {
  const massSchedulesDaf = new D1MassSchedulesDAF(c.env.DB);
  const eventSchedulesDaf = new D1EventSchedulesDAF(c.env.DB);
  const massScheduleExceptionsDaf = new D1MassScheduleExceptionsDAF(c.env.DB);
  const communitiesDaf = new D1CommunitiesDAF(c.env.DB);

  const useCase = new ListCalendarUseCase(
    massSchedulesDaf,
    eventSchedulesDaf,
    massScheduleExceptionsDaf,
    communitiesDaf,
  );

  return useCase;
}
