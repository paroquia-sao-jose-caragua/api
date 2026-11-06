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
      startTime: '09:30',
      isPrecept: false,
      active: true,
    });

    expect(massSchedule.id).toBeDefined();
    expect(massSchedule.startTime).toBe('09:30');
  });

  it('should be able to create a ordinary weekly mass schedule as precept', async () => {
    const { massSchedule } = await sut.execute({
      communityId: community.id,
      type: 'ordinary',
      recurrenceType: 'weekly',
      dayOfWeek: 0, // Sunday
      startTime: '09:30',
      isPrecept: true,
      active: true,
    });

    expect(massSchedule.id).toBeDefined();
    expect(massSchedule.isPrecept).toBe(true);
  });

  it('should be able to create a devotional monthly mass schedule', async () => {
    const { massSchedule } = await sut.execute({
      communityId: community.id,
      type: 'devotional',
      recurrenceType: 'monthly',
      dayOfMonth: 19,
      startTime: '19:30',
      isPrecept: false,
      active: true,
    });

    expect(massSchedule.id).toBeDefined();
    expect(massSchedule.dayOfMonth).toBe(19);
  });

  it('should be able to create a solemnity mass schedule', async () => {
    const { massSchedule } = await sut.execute({
      communityId: community.id,
      type: 'solemnity',
      recurrenceType: 'weekly',
      dayOfWeek: 0,
      startTime: '19:30',
      isPrecept: true,
      active: true,
    });

    expect(massSchedule.id).toBeDefined();
    expect(massSchedule.type).toBe('solemnity');
  });

  it('should be able to create a devotional monthly mass schedule with week of month', async () => {
    const { massSchedule } = await sut.execute({
      communityId: community.id,
      type: 'devotional',
      recurrenceType: 'monthly',
      dayOfWeek: 6, // Saturday
      weekOfMonth: 1, // 1st week of the month
      startTime: '08:00',
      isPrecept: false,
      active: true,
    });

    expect(massSchedule.id).toBeDefined();
    expect(massSchedule.weekOfMonth).toBe(1);
  });

  it('should not be able to create a mass schedule with a non-existing community', async () => {
    await expect(() =>
      sut.execute({
        communityId: 'non-existing-community-id',
        type: 'ordinary',
        recurrenceType: 'weekly',
        dayOfWeek: 2,
        startTime: '18:00',
        isPrecept: false,
        active: true,
      }),
    ).rejects.toThrowError('COMMUNITY_NOT_FOUND');
  });
});
