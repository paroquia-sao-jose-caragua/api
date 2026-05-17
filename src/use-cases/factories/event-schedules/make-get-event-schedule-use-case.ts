import { D1EventSchedulesDAF } from '@/services/database/d1/d1-event-schedules-daf';
import { GetEventScheduleUseCase } from '@/use-cases/event-schedules/get-event-schedule';

export function makeGetEventScheduleUseCase(c: DomainContext) {
  const eventSchedulesDaf = new D1EventSchedulesDAF(c.env.DB);

  const useCase = new GetEventScheduleUseCase(eventSchedulesDaf);

  return useCase;
}
