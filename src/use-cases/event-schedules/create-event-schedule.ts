import type { EventSchedule } from '@/entities/event-schedule';
import type { CommunitiesDAF } from '@/services/database/communities-daf';
import type { EventSchedulesDAF } from '@/services/database/event-schedules-daf';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { makeId } from '../factories/make-id';

interface CreateEventScheduleUseCaseRequest {
  communityId: string;
  title?: string;
  type: EventSchedule['type'];
  massType?: EventSchedule['massType'];
  isPrecept?: boolean;
  eventDate: string;
  startTime: string;
  endTime?: string;
  customLocation?: string;
  orientations?: string;
}

interface CreateEventScheduleUseCaseResponse {
  eventSchedule: EventSchedule;
}

export class CreateEventScheduleUseCase {
  constructor(
    private eventSchedulesDaf: EventSchedulesDAF,
    private communitiesDaf: CommunitiesDAF,
  ) {}

  async execute({
    communityId,
    title,
    type,
    massType,
    isPrecept,
    eventDate,
    startTime,
    endTime,
    customLocation,
    orientations,
  }: CreateEventScheduleUseCaseRequest): Promise<CreateEventScheduleUseCaseResponse> {
    const community = await this.communitiesDaf.findById(communityId);

    if (!community) {
      throw new ResourceNotFoundError();
    }

    const eventSchedule = {
      id: makeId(),
      communityId,
      title,
      type,
      massType,
      isPrecept,
      eventDate,
      startTime,
      endTime,
      customLocation,
      orientations,
      createdAt: new Date().toISOString(),
    };

    await this.eventSchedulesDaf.create(eventSchedule);

    return {
      eventSchedule,
    };
  }
}
