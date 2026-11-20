import type { MassSchedule } from '@/entities/mass-schedule';
import type { CommunitiesDAF } from '@/services/database/communities-daf';
import type { MassSchedulesDAF } from '@/services/database/mass-schedules-daf';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { makeId } from '../factories/make-id';

interface CreateMassScheduleUseCaseRequest {
  communityId: string;
  title?: string;
  type: MassSchedule['type'];
  orientations?: string;
  isPrecept: boolean;
  recurrenceType: MassSchedule['recurrenceType'];
  dayOfWeek?: number;
  dayOfMonth?: number;
  weekOfMonth?: number;
  startDate?: string;
  endDate?: string;
  active?: boolean;
  startTime: string; // "HH:MM"
}

interface CreateMassScheduleUseCaseResponse {
  massSchedule: MassSchedule;
}

export class CreateMassScheduleUseCase {
  constructor(
    private massSchedulesDaf: MassSchedulesDAF,
    private communitiesDaf: CommunitiesDAF,
  ) {}

  async execute({
    communityId,
    title,
    type,
    orientations,
    isPrecept,
    recurrenceType,
    dayOfWeek,
    dayOfMonth,
    weekOfMonth,
    startDate,
    endDate,
    active,
    startTime,
  }: CreateMassScheduleUseCaseRequest): Promise<CreateMassScheduleUseCaseResponse> {
    const community = await this.communitiesDaf.findById(communityId);

    if (!community) {
      throw new ResourceNotFoundError('COMMUNITY_NOT_FOUND');
    }

    const massScheduleId = makeId();

    const massSchedule: MassSchedule = {
      id: massScheduleId,
      communityId,
      title,
      type,
      orientations,
      isPrecept,
      recurrenceType,
      dayOfWeek,
      dayOfMonth,
      weekOfMonth,
      active: active ?? true,
      startDate,
      endDate,
      startTime,
      createdAt: new Date().toISOString(),
    };

    await this.massSchedulesDaf.create(massSchedule);

    return {
      massSchedule,
    };
  }
}
