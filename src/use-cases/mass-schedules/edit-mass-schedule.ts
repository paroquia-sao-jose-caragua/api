import type { MassSchedule } from '@/entities/mass-schedule';
import type { MassSchedulesDAF } from '@/services/database/mass-schedules-daf';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { makeId } from '../factories/make-id';

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
  monthOfYear?: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
  times: { startTime: string; endTime?: string }[]; // Array de horários no formato "HH:MM"
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
    monthOfYear,
    startDate,
    endDate,
    active,
    times,
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
    massSchedule.monthOfYear = monthOfYear;
    massSchedule.startDate = startDate;
    massSchedule.endDate = endDate;
    massSchedule.active = active;
    massSchedule.times = times.map((time) => ({
      id: makeId(),
      scheduleId: massSchedule.id,
      startTime: time.startTime,
      endTime: time.endTime,
    }));

    await this.massSchedulesDaf.save(massSchedule);

    return {
      massSchedule,
    };
  }
}
