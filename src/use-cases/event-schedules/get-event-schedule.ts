import type { EventSchedule } from '@/entities/event-schedule';
import type { EventSchedulesDAF } from '@/services/database/event-schedules-daf';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

interface GetEventScheduleUseCaseRequest {
  eventScheduleId: string;
}

interface GetEventScheduleUseCaseResponse {
  eventSchedule: EventSchedule;
}

export class GetEventScheduleUseCase {
  constructor(private eventSchedulesDaf: EventSchedulesDAF) {}

  async execute({
    eventScheduleId,
  }: GetEventScheduleUseCaseRequest): Promise<GetEventScheduleUseCaseResponse> {
    const eventSchedule =
      await this.eventSchedulesDaf.findById(eventScheduleId);

    if (!eventSchedule) {
      throw new ResourceNotFoundError();
    }

    return {
      eventSchedule,
    };
  }
}
