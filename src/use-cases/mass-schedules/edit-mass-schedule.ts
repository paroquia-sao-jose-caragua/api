import type { MassSchedule } from '@/entities/mass-schedule';
import type { MassSchedulesDAF } from '@/services/database/mass-schedules-daf';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

interface EditMassScheduleUseCaseRequest {
  massScheduleId: string;
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
  active: boolean;
  startTime: string; // "HH:MM"
}

interface EditMassScheduleUseCaseResponse {
  massSchedule: MassSchedule;
}

export class EditMassScheduleUseCase {
  constructor(private massSchedulesDaf: MassSchedulesDAF) {}

  async execute({
    massScheduleId,
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
  }: EditMassScheduleUseCaseRequest): Promise<EditMassScheduleUseCaseResponse> {
    const massSchedule = await this.massSchedulesDaf.findById(massScheduleId);

    if (!massSchedule) {
      throw new ResourceNotFoundError('MASS_SCHEDULE_NOT_FOUND');
    }

    massSchedule.title = title;
    massSchedule.type = type;
    massSchedule.orientations = orientations;
    massSchedule.isPrecept = isPrecept;
    massSchedule.recurrenceType = recurrenceType;
    massSchedule.dayOfWeek = dayOfWeek;
    massSchedule.dayOfMonth = dayOfMonth;
    massSchedule.weekOfMonth = weekOfMonth;
    massSchedule.startDate = startDate;
    massSchedule.endDate = endDate;
    massSchedule.active = active;
    massSchedule.startTime = startTime;
    massSchedule.updatedAt = new Date().toISOString();

    await this.massSchedulesDaf.save(massSchedule);

    return {
      massSchedule,
    };
  }
}
