import type { MassSchedule } from '@/entities/mass-schedule';
import { EditMassScheduleUseCase } from '@/use-cases/mass-schedules/edit-mass-schedule';
import { InMemoryMassSchedulesDAF } from '@tests/database/in-memory-mass-schedules-daf';
import { makeMassSchedule } from '@tests/factories/make-mass-schedule';
import { beforeEach, describe, expect, it } from 'vitest';

let massSchedulesDaf: InMemoryMassSchedulesDAF;
let sut: EditMassScheduleUseCase;

let massSchedule: MassSchedule;

describe('Edit Mass Schedule Use Case', () => {
  beforeEach(async () => {
    massSchedulesDaf = new InMemoryMassSchedulesDAF();
    sut = new EditMassScheduleUseCase(massSchedulesDaf);

    massSchedule = makeMassSchedule();
    await massSchedulesDaf.create(massSchedule);
  });

  it('should be able to edit a ordinary weekly mass schedule', async () => {
    const { massSchedule: newMassSchedule } = await sut.execute({
      massScheduleId: massSchedule.id,
      type: 'ordinary',
      recurrenceType: 'weekly',
      dayOfWeek: 3, // Wednesday
      times: [
        {
          startTime: '09:30',
          endTime: '10:30',
        },
        {
          startTime: '19:30',
          endTime: '20:30',
        },
      ],
      isPrecept: false,
      active: true,
    });

    expect(newMassSchedule).toEqual(
      expect.objectContaining({
        id: massSchedule.id,
        type: 'ordinary',
        recurrenceType: 'weekly',
        times: [
          {
            id: expect.any(String),
            startTime: '09:30',
            endTime: '10:30',
            scheduleId: massSchedule.id,
          },
          {
            id: expect.any(String),
            startTime: '19:30',
            endTime: '20:30',
            scheduleId: massSchedule.id,
          },
        ],
      }),
    );
  });

  it('should be able to edit a mass schedule removing endTime', async () => {
    const { massSchedule: newMassSchedule } = await sut.execute({
      massScheduleId: massSchedule.id,
      type: 'ordinary',
      recurrenceType: 'weekly',
      dayOfWeek: 3,
      times: [
        {
          startTime: '19:30',
        },
      ],
      isPrecept: false,
      active: true,
    });

    expect(newMassSchedule.times).toHaveLength(1);
    expect(newMassSchedule.times[0].startTime).toBe('19:30');
    expect(newMassSchedule.times[0].endTime).toBeUndefined();
  });

  it('should not be able to edit a mass schedule with a non-existing id', async () => {
    await expect(() =>
      sut.execute({
        massScheduleId: 'non-existing-id',
        type: 'ordinary',
        recurrenceType: 'weekly',
        dayOfWeek: 2,
        times: [
          {
            startTime: '09:30',
            endTime: '10:30',
          },
        ],
        isPrecept: false,
        active: true,
      }),
    ).rejects.toThrowError('MASS_SCHEDULE_NOT_FOUND');
  });
});
