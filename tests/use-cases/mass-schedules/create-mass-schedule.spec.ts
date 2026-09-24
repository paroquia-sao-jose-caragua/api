import type { Community } from '@/entities/community';
import { CreateMassScheduleUseCase } from '@/use-cases/mass-schedules/create-mass-schedule';
import { InMemoryCommunitiesDAF } from '@tests/database/in-memory-communities-daf';
import { InMemoryMassSchedulesDAF } from '@tests/database/in-memory-mass-schedules-daf';
import { makeCommunity } from '@tests/factories/make-community';
import { beforeEach, describe, expect, it } from 'vitest';

let massSchedulesDaf: InMemoryMassSchedulesDAF;
let communitiesDaf: InMemoryCommunitiesDAF;
let sut: CreateMassScheduleUseCase;

let community: Community;

describe('Create Mass Schedule Use Case', () => {
  beforeEach(async () => {
    massSchedulesDaf = new InMemoryMassSchedulesDAF();
    communitiesDaf = new InMemoryCommunitiesDAF();
    sut = new CreateMassScheduleUseCase(massSchedulesDaf, communitiesDaf);

    community = makeCommunity();
    await communitiesDaf.create(community);
  });

  it('should be able to create a ordinary weekly mass schedule', async () => {
    const { massSchedule } = await sut.execute({
      communityId: community.id,
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

    expect(massSchedule.id).toBeDefined();
  });

  it('should be able to create a ordinary weekly mass schedule as precept', async () => {
    const { massSchedule } = await sut.execute({
      communityId: community.id,
      type: 'ordinary',
      recurrenceType: 'weekly',
      dayOfWeek: 0, // Sunday
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
      isPrecept: true,
      active: true,
    });

    expect(massSchedule.id).toBeDefined();
  });

  it('should be able to create a devotional monthly mass schedule', async () => {
    const { massSchedule } = await sut.execute({
      communityId: community.id,
      type: 'devotional',
      title: 'Saint Joseph',
      recurrenceType: 'monthly',
      dayOfMonth: 19,
      times: [
        {
          startTime: '19:30',
          endTime: '20:30',
        },
      ],
      isPrecept: false,
      active: true,
    });

    expect(massSchedule.id).toBeDefined();
  });

  it('should be able to create a solemnity monthly mass schedule', async () => {
    const { massSchedule } = await sut.execute({
      communityId: community.id,
      type: 'solemnity',
      title: 'Saint Joseph',
      recurrenceType: 'yearly',
      dayOfMonth: 19,
      monthOfYear: 3, // March
      times: [
        {
          startTime: '19:30',
          endTime: '20:30',
        },
      ],
      isPrecept: true,
      active: true,
    });

    expect(massSchedule.id).toBeDefined();
  });

  it('should be able to create a devotional weekly mass schedule on specific weekly of month', async () => {
    const { massSchedule } = await sut.execute({
      communityId: community.id,
      type: 'devotional',
      title: 'Communion of Reparation to the Immaculate Heart of Mary',
      recurrenceType: 'weekly',
      dayOfWeek: 6, // Saturday
      weekOfMonth: 1, // First week
      times: [
        {
          startTime: '08:00',
          endTime: '09:00',
        },
      ],
      isPrecept: false,
      active: true,
    });

    expect(massSchedule.id).toBeDefined();
  });

  it('should be able to create a mass schedule without endTime', async () => {
    const { massSchedule } = await sut.execute({
      communityId: community.id,
      type: 'ordinary',
      recurrenceType: 'weekly',
      dayOfWeek: 6, // Saturday
      times: [
        {
          startTime: '19:30',
        },
      ],
      isPrecept: true,
      active: true,
    });

    expect(massSchedule.id).toBeDefined();
    expect(massSchedule.times[0].startTime).toBe('19:30');
    expect(massSchedule.times[0].endTime).toBeUndefined();
  });

  it('should not be able to create a mass schedule with a non-existing community', async () => {
    await expect(() =>
      sut.execute({
        communityId: 'non-existing-community-id',
        type: 'ordinary',
        recurrenceType: 'weekly',
        dayOfWeek: 2,
        times: [
          {
            startTime: '18:00',
            endTime: '19:00',
          },
        ],
        isPrecept: false,
        active: true,
      }),
    ).rejects.toThrowError('COMMUNITY_NOT_FOUND');
  });
});
