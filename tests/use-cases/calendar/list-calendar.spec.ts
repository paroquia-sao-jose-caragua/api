import type { Community } from '@/entities/community';
import { ListCalendarUseCase } from '@/use-cases/calendar/list-calendar';
import { makeId } from '@/use-cases/factories/make-id';
import { InMemoryCommunitiesDAF } from '@tests/database/in-memory-communities-daf';
import { InMemoryEventSchedulesDAF } from '@tests/database/in-memory-event-schedules-daf';
import { InMemoryMassScheduleExceptionsDAF } from '@tests/database/in-memory-mass-schedule-exceptions-daf';
import { InMemoryMassSchedulesDAF } from '@tests/database/in-memory-mass-schedules-daf';
import { makeCommunity } from '@tests/factories/make-community';
import { makeEventSchedule } from '@tests/factories/make-event-schedule';
import { makeMassSchedule } from '@tests/factories/make-mass-schedule';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let massSchedulesDaf: InMemoryMassSchedulesDAF;
let eventSchedulesDaf: InMemoryEventSchedulesDAF;
let massScheduleExceptionsDaf: InMemoryMassScheduleExceptionsDAF;
let communitiesDaf: InMemoryCommunitiesDAF;
let sut: ListCalendarUseCase;

let communityParish: Community;
let communitySacredHeart: Community;

describe('List Calendar Use Case', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));

    massSchedulesDaf = new InMemoryMassSchedulesDAF();
    eventSchedulesDaf = new InMemoryEventSchedulesDAF();
    massScheduleExceptionsDaf = new InMemoryMassScheduleExceptionsDAF();
    communitiesDaf = new InMemoryCommunitiesDAF();
    sut = new ListCalendarUseCase(
      massSchedulesDaf,
      eventSchedulesDaf,
      massScheduleExceptionsDaf,
      communitiesDaf,
    );

    communityParish = makeCommunity({
      name: 'Paróquia São José',
      address: 'Rua Principal, 123',
    });

    communitySacredHeart = makeCommunity({
      name: 'Sagrado Coração de Jesus',
      address: 'Avenida Central, 456',
    });

    communitiesDaf.communities.push(communityParish, communitySacredHeart);

    const massSchedules = [
      makeMassSchedule({
        id: '01K8M79EYSVFJEJZVRAEFVM6QD',
        communityId: communityParish.id,
        type: 'ordinary',
        active: true,
        recurrenceType: 'weekly',
        dayOfWeek: 4, // Wednesday
        startTime: '19:30',
      }),
      makeMassSchedule({
        id: '01K8PTP0X913WM25APCM8HVZ7M',
        communityId: communityParish.id,
        type: 'ordinary',
        active: true,
        recurrenceType: 'weekly',
        dayOfWeek: 5, // Thursday
        startTime: '19:30',
      }),
      makeMassSchedule({
        id: '01K8M7GZSNKGNQE99PJJ197BHZ',
        communityId: communityParish.id,
        type: 'ordinary',
        active: true,
        recurrenceType: 'weekly',
        dayOfWeek: 0, // Sunday
        isPrecept: true,
        startTime: '9:30',
      }),
      makeMassSchedule({
        id: '01K8M7GZSNKGNQE99PJJ197BHZ-2',
        communityId: communityParish.id,
        type: 'ordinary',
        active: true,
        recurrenceType: 'weekly',
        dayOfWeek: 0, // Sunday
        isPrecept: true,
        startTime: '19:30',
      }),
      makeMassSchedule({
        id: '01K8M9V3CWPMSRJM008P88HTKK',
        communityId: communitySacredHeart.id,
        type: 'ordinary',
        active: true,
        recurrenceType: 'weekly',
        dayOfWeek: 0, // Sunday
        isPrecept: true,
        startTime: '11:00',
      }),
      makeMassSchedule({
        id: '01K8M7J2DCBSM5SAXS33PZNB5S',
        communityId: communityParish.id,
        type: 'devotional',
        title: 'Padroeiro São José',
        active: true,
        recurrenceType: 'monthly',
        dayOfMonth: 19,
        startTime: '19:30',
      }),
      makeMassSchedule({
        id: '01K8M7W6TPHMH3805PW53GWNQM',
        communityId: communityParish.id,
        type: 'solemnity',
        title: 'São José',
        active: true,
        isPrecept: true,
        recurrenceType: 'monthly',
        dayOfMonth: 19,
        startDate: '2025-03-01',
        endDate: '2025-03-31',
        startTime: '19:30',
      }),
      makeMassSchedule({
        id: '01K8M7MSRJABN7P072NCSGEEVW',
        communityId: communityParish.id,
        type: 'devotional',
        title: 'Imaculado Coração de Maria',
        active: true,
        recurrenceType: 'monthly',
        weekOfMonth: 1,
        dayOfWeek: 6, // Saturday
        startTime: '08:00',
      }),
      makeMassSchedule({
        id: '01K8M7PBAYX1AVKVQX0M5EKD5C',
        communityId: communitySacredHeart.id,
        type: 'devotional',
        title: 'Sagrado Coração de Jesus',
        active: true,
        recurrenceType: 'monthly',
        weekOfMonth: 1,
        dayOfWeek: 5, // Friday
        startTime: '08:00',
      }),
    ];

    massSchedulesDaf.massSchedules.push(...massSchedules);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return schedules for first friday and first saturday of the month', async () => {
    const { calendar } = await sut.execute({ month: 1, year: 2025 });

    expect(calendar).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: '2025-01-03',
          dayOfWeek: 5,
          schedules: expect.objectContaining({
            active: expect.arrayContaining([
              expect.objectContaining({
                type: 'mass',
                massType: 'devotional',
                title: 'Sagrado Coração de Jesus',
                community: expect.objectContaining({
                  id: communitySacredHeart.id,
                  name: communitySacredHeart.name,
                  address: communitySacredHeart.address,
                }),
              }),
            ]),
          }),
        }),
        expect.objectContaining({
          date: '2025-01-04',
          dayOfWeek: 6,
          schedules: expect.objectContaining({
            active: expect.arrayContaining([
              expect.objectContaining({
                type: 'mass',
                massType: 'devotional',
                title: 'Imaculado Coração de Maria',
                community: expect.objectContaining({
                  id: communityParish.id,
                  name: communityParish.name,
                  address: communityParish.address,
                }),
              }),
            ]),
          }),
        }),
      ]),
    );
  });

  it('should prioritize Sunday Masses over devotional Masses', async () => {
    const { calendar } = await sut.execute({ month: 1, year: 2025 });

    expect(calendar).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: '2025-01-19',
          dayOfWeek: 0,
          schedules: expect.objectContaining({
            active: expect.arrayContaining([
              expect.objectContaining({
                type: 'mass',
                massType: 'ordinary',
                startTime: '9:30',
                community: expect.objectContaining({
                  id: communityParish.id,
                  name: communityParish.name,
                  address: communityParish.address,
                }),
              }),
              expect.objectContaining({
                type: 'mass',
                massType: 'ordinary',
                startTime: '11:00',
                community: expect.objectContaining({
                  id: communitySacredHeart.id,
                  name: communitySacredHeart.name,
                  address: communitySacredHeart.address,
                }),
              }),
              expect.objectContaining({
                type: 'mass',
                massType: 'ordinary',
                startTime: '19:30',
                community: expect.objectContaining({
                  id: communityParish.id,
                  name: communityParish.name,
                  address: communityParish.address,
                }),
              }),
            ]),
          }),
        }),
      ]),
    );
  });

  it('should prioritize Solemnity Masses and cancel other schedules', async () => {
    const { calendar } = await sut.execute({ month: 3, year: 2025 });

    expect(calendar).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: '2025-03-19',
          dayOfWeek: 3, // Wednesday
          schedules: expect.objectContaining({
            active: [
              expect.objectContaining({
                type: 'mass',
                massType: 'solemnity',
                title: 'São José',
                community: expect.objectContaining({
                  id: communityParish.id,
                  name: communityParish.name,
                  address: communityParish.address,
                }),
              }),
            ],
          }),
        }),
      ]),
    );
  });

  it('should prioritize devotional Masses over regular schedules in same time', async () => {
    const { calendar } = await sut.execute({ month: 6, year: 2025 });

    expect(calendar).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: '2025-06-19',
          dayOfWeek: 4, // Thursday
          schedules: expect.objectContaining({
            active: [
              expect.objectContaining({
                type: 'mass',
                massType: 'devotional',
                title: 'Padroeiro São José',
                community: expect.objectContaining({
                  id: communityParish.id,
                  name: communityParish.name,
                  address: communityParish.address,
                }),
              }),
            ],
          }),
        }),
      ]),
    );
  });

  it('should mark exceptions in mass schedules', async () => {
    await massScheduleExceptionsDaf.create({
      id: makeId(),
      scheduleId: '01K8M7GZSNKGNQE99PJJ197BHZ', // Sunday mass at parish
      exceptionDate: '2025-01-05',
      startTime: '9:30',
      reason: 'No mass this day',
      createdBy: makeId(),
      createdAt: new Date().toISOString(),
    });

    const { calendar } = await sut.execute({ month: 1, year: 2025 });

    const dayWithException = calendar.find((day) => day.date === '2025-01-05');

    expect(dayWithException).toBeDefined();
    expect(dayWithException?.schedules.exceptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'mass',
          massType: 'ordinary',
          startTime: '9:30',
          exception: expect.objectContaining({
            reason: 'No mass this day',
          }),
        }),
      ]),
    );
  });

  it('should schedule events', async () => {
    const eventSchedules = [
      makeEventSchedule({
        communityId: communityParish.id,
        title: 'Aniversário da Paróquia',
        type: 'anniversary',
        eventDate: '2025-01-15',
        startTime: '18:00',
      }),
      makeEventSchedule({
        communityId: communitySacredHeart.id,
        title: 'Festa do Sagrado Coração',
        type: 'feast',
        eventDate: '2025-01-15',
        startTime: '19:00',
      }),
    ];

    eventSchedulesDaf.eventSchedules.push(...eventSchedules);

    const { calendar } = await sut.execute({ month: 1, year: 2025 });

    expect(calendar).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: '2025-01-15',
          dayOfWeek: 3,
          schedules: expect.objectContaining({
            active: expect.arrayContaining([
              expect.objectContaining({
                type: 'event',
                title: 'Aniversário da Paróquia',
                community: expect.objectContaining({
                  id: communityParish.id,
                  name: communityParish.name,
                  address: communityParish.address,
                }),
              }),
              expect.objectContaining({
                type: 'event',
                title: 'Festa do Sagrado Coração',
                community: expect.objectContaining({
                  id: communitySacredHeart.id,
                  name: communitySacredHeart.name,
                  address: communitySacredHeart.address,
                }),
              }),
            ]),
          }),
        }),
      ]),
    );
  });

  it('should mark Sunday as precept day', async () => {
    const { calendar } = await sut.execute({ month: 3, year: 2025 });

    const sunday = calendar.find((day) => day.dayOfWeek === 0);

    expect(sunday).toBeDefined();
    expect(sunday?.isPreceptDay).toBe(true);
  });
});
