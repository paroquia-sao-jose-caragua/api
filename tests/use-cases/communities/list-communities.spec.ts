import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryCommunitiesDAF } from '@/../tests/database/in-memory-communities-daf';
import { InMemoryMassSchedulesDAF } from '@/../tests/database/in-memory-mass-schedules-daf';
import { ListCommunitiesUseCase } from '@/use-cases/communities/list-communities';

let communitiesDaf: InMemoryCommunitiesDAF;
let massSchedulesDaf: InMemoryMassSchedulesDAF;
let sut: ListCommunitiesUseCase;

describe('List Communities Use Case', () => {
  beforeEach(() => {
    communitiesDaf = new InMemoryCommunitiesDAF();
    massSchedulesDaf = new InMemoryMassSchedulesDAF();
    sut = new ListCommunitiesUseCase(communitiesDaf, massSchedulesDaf);
  });

  it('should be able to list communities with their active mass schedules', async () => {
    await communitiesDaf.create({
      id: 'community-1',
      name: 'Matriz São José',
      slug: 'matriz-sao-jose',
      type: 'parish_church',
      address: 'Rua Principal, 123',
      coverId: 'cover-1',
      createdAt: new Date().toISOString(),
    });

    await communitiesDaf.create({
      id: 'community-2',
      name: 'Capela Sagrado Coração',
      slug: 'capela-sagrado-coracao',
      type: 'chapel',
      address: 'Rua Secundária, 456',
      coverId: 'cover-2',
      createdAt: new Date().toISOString(),
    });

    await massSchedulesDaf.create({
      id: 'schedule-1',
      communityId: 'community-1',
      type: 'ordinary',
      recurrenceType: 'weekly',
      dayOfWeek: 0,
      isPrecept: true,
      active: true,
      createdAt: new Date().toISOString(),
      times: [
        {
          id: 'time-1',
          scheduleId: 'schedule-1',
          startTime: '08:00',
          endTime: '09:00',
        },
        {
          id: 'time-2',
          scheduleId: 'schedule-1',
          startTime: '19:30',
          endTime: '20:30',
        },
      ],
    });

    await massSchedulesDaf.create({
      id: 'schedule-2',
      communityId: 'community-1',
      type: 'ordinary',
      recurrenceType: 'weekly',
      dayOfWeek: 3,
      isPrecept: false,
      active: true, // Active ordinary Wednesday should be included
      createdAt: new Date().toISOString(),
      times: [
        {
          id: 'time-3',
          scheduleId: 'schedule-2',
          startTime: '19:30',
          endTime: '20:30',
        },
      ],
    });

    await massSchedulesDaf.create({
      id: 'schedule-3',
      communityId: 'community-1',
      type: 'ordinary',
      recurrenceType: 'weekly',
      dayOfWeek: 5,
      isPrecept: false,
      active: false, // Inactive should be filtered out
      createdAt: new Date().toISOString(),
      times: [
        {
          id: 'time-4',
          scheduleId: 'schedule-3',
          startTime: '19:00',
          endTime: '20:00',
        },
      ],
    });

    await massSchedulesDaf.create({
      id: 'schedule-4',
      communityId: 'community-1',
      type: 'devotional',
      recurrenceType: 'monthly',
      dayOfMonth: 19,
      isPrecept: false,
      active: true, // Devotional should be filtered out in home list
      createdAt: new Date().toISOString(),
      times: [
        {
          id: 'time-5',
          scheduleId: 'schedule-4',
          startTime: '19:30',
          endTime: '20:30',
        },
      ],
    });

    await massSchedulesDaf.create({
      id: 'schedule-5',
      communityId: 'community-1',
      type: 'solemnity',
      recurrenceType: 'yearly',
      dayOfMonth: 25,
      monthOfYear: 12,
      isPrecept: true,
      active: true, // Solemnity should be filtered out in home list
      createdAt: new Date().toISOString(),
      times: [
        {
          id: 'time-6',
          scheduleId: 'schedule-5',
          startTime: '10:00',
          endTime: '11:00',
        },
      ],
    });

    const { communities } = await sut.execute();

    expect(communities).toHaveLength(2);
    expect(communities[0].massSchedules).toHaveLength(2);
    expect(communities[0].massSchedules?.[0].id).toBe('schedule-1');
    expect(communities[0].massSchedules?.[0].times).toHaveLength(2);
    expect(communities[0].massSchedules?.[1].id).toBe('schedule-2');
    expect(communities[0].massSchedules?.[1].times).toHaveLength(1);
    expect(communities[1].massSchedules).toHaveLength(0);
  });
});
