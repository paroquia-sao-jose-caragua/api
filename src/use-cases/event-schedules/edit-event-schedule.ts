import type { EventSchedule } from '@/entities/event-schedule';
import type { CommunitiesDAF } from '@/services/database/communities-daf';
import type { EventSchedulesDAF } from '@/services/database/event-schedules-daf';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

interface EditEventScheduleUseCaseRequest {
  eventScheduleId: string;
  communityId: string;
  title?: string;
  massType?: EventSchedule['massType'];
  isPrecept?: boolean;
  type: EventSchedule['type'];
  eventDate: string;
  startTime: string;
  endTime?: string;
  customLocation?: string;
  orientations?: string;
}

interface EditEventScheduleUseCaseResponse {
  eventSchedule: EventSchedule;
}

export class EditEventScheduleUseCase {
  constructor(
    private eventSchedulesDaf: EventSchedulesDAF,
    private communitiesDaf: CommunitiesDAF,
  ) {}

  async execute({
    eventScheduleId,
    title,
    type,
    massType,
    communityId,
    isPrecept,
    eventDate,
    startTime,
    endTime,
    customLocation,
    orientations,
  }: EditEventScheduleUseCaseRequest): Promise<EditEventScheduleUseCaseResponse> {
    const eventSchedule =
      await this.eventSchedulesDaf.findById(eventScheduleId);

    if (!eventSchedule) {
      throw new ResourceNotFoundError();
    }

    const community = await this.communitiesDaf.findById(communityId);

    if (!community) {
      throw new ResourceNotFoundError();
    }

    eventSchedule.communityId = communityId;
    eventSchedule.title = title;
    eventSchedule.type = type;
    eventSchedule.massType = massType;
    eventSchedule.isPrecept = isPrecept;
    eventSchedule.eventDate = eventDate;
    eventSchedule.startTime = startTime;
    eventSchedule.endTime = endTime;
    eventSchedule.customLocation = customLocation;
    eventSchedule.orientations = orientations;
    eventSchedule.updatedAt = new Date().toISOString();

    await this.eventSchedulesDaf.update(eventSchedule);

    return {
      eventSchedule,
    };
  }
}
