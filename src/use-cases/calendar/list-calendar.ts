import type { CalendarSchedule } from '@/entities/calendar-schedule';
import type { Community } from '@/entities/community';
import type { CommunitiesDAF } from '@/services/database/communities-daf';
import type { EventSchedulesDAF } from '@/services/database/event-schedules-daf';
import type { MassScheduleExceptionsDAF } from '@/services/database/mass-schedule-exceptions-daf';
import type { MassSchedulesDAF } from '@/services/database/mass-schedules-daf';
import moment from 'moment';

interface ListCalendarUseCaseRequest {
  month: number;
  year: number;
}

export class ListCalendarUseCase {
  constructor(
    private massSchedulesDaf: MassSchedulesDAF,
    private eventSchedulesDaf: EventSchedulesDAF,
    private massSchedulesExceptionsDaf: MassScheduleExceptionsDAF,
    private communitiesDaf: CommunitiesDAF,
  ) {}

  async execute({ month, year }: ListCalendarUseCaseRequest) {
    const baseYear = year ?? moment().year();

    const firstDateOfMonth = moment({
      year: baseYear,
      month: month - 1,
    }).startOf('month');
    const lastDateOfMonth = moment({ year: baseYear, month: month - 1 }).endOf(
      'month',
    );

    const firstDayOfMonth = firstDateOfMonth.get('date');
    const lastDayOfMonth = lastDateOfMonth.get('date');

    const communities = await this.communitiesDaf.findAll();

    const massSchedules = await this.massSchedulesDaf.findAll();

    const eventSchedules = await this.eventSchedulesDaf.findMany({
      from: firstDateOfMonth.format('YYYY-MM-DD'),
      to: lastDateOfMonth.format('YYYY-MM-DD'),
    });

    let calendar: CalendarSchedule[] = [];

    for (let day = firstDayOfMonth; day <= lastDayOfMonth; day++) {
      const date = moment()
        .month(month - 1)
        .date(day)
        .format('YYYY-MM-DD');

      const weekday = moment(date).weekday();

      let massSchedulesInDate = massSchedules.filter((schedule) => {
        if (!schedule.active) return;

        const scheduleStart = schedule.startDate
          ? moment(schedule.startDate)
          : null;

        const scheduleEnd = schedule.endDate ? moment(schedule.endDate) : null;

        const now = moment();

        if (!schedule.active) {
          return;
        }

        if (scheduleStart && now.isBefore(scheduleStart, 'month')) {
          return;
        }

        if (scheduleEnd && now.isAfter(scheduleEnd, 'month')) {
          return;
        }

        if (schedule.recurrenceType === 'yearly') {
          return schedule.monthOfYear === month && schedule.dayOfMonth === day;
        }

        if (schedule.recurrenceType === 'monthly') {
          // Para devoções do primeiro sábado/sexta
          if (schedule.dayOfWeek !== undefined && schedule.weekOfMonth === 1) {
            return isFirstWeekdayOfMonth(moment(date), schedule.dayOfWeek);
          }
          // Para dia fixo do mês
          return schedule.dayOfMonth === day;
        }

        if (schedule.recurrenceType === 'weekly') {
          return schedule.dayOfWeek === weekday;
        }
      });

      // Se houver solenidade, remove outros agendamentos da mesma data
      const hasSolemnity = massSchedulesInDate.some(
        (s) => s.type === 'solemnity',
      );
      if (hasSolemnity) {
        massSchedulesInDate = massSchedulesInDate.filter(
          (s) => s.type === 'solemnity',
        );
      }

      // Se missa devocional cai em um domingo, remove ela e prevalece a liturgia de domingo
      const isSunday = weekday === 0;
      if (isSunday) {
        massSchedulesInDate = massSchedulesInDate.filter(
          (s) => s.type !== 'devotional',
        );
      }

      // Se missa devocional cai em dia ordinário, remove agendamentos de mesmo horário e prevalece a missa devocional
      const hasDevotional = massSchedulesInDate.some(
        (s) => s.type === 'devotional',
      );
      const devocionalTimes = massSchedulesInDate
        .filter((s) => s.type === 'devotional')
        .flatMap((s) => s.times.map((t) => t.startTime));
      if (hasDevotional) {
        massSchedulesInDate = massSchedulesInDate.filter((s) => {
          if (s.type === 'devotional') return true;

          const overlapping = s.times.some((t) =>
            devocionalTimes.includes(t.startTime),
          );
          return !overlapping;
        });
      }

      const priorityTypes = ['solemnity', 'devotional', 'ordinary'];

      const schedules: CalendarSchedule['schedules'] = massSchedulesInDate
        .sort(
          (a, b) =>
            priorityTypes.indexOf(a.type) - priorityTypes.indexOf(b.type),
        )
        .flatMap((schedule) => {
          const community = communities.find(
            (c) => c.id === schedule.communityId,
          ) as Community;

          return schedule.times.map((time) => ({
            type: 'mass' as const,
            title: schedule.title,
            massType: schedule.type,
            orientations: schedule.orientations,
            isPrecept: schedule.isPrecept,
            startTime: time.startTime,
            endTime: time.endTime,
            status: 'active',
            community: {
              id: schedule.communityId,
              type: community.type,
              name: community.name,
              address: community.address,
            },
          }));
        });

      const eventSchedulesInDate = eventSchedules.filter(
        (es) => es.eventDate === date,
      );

      if (eventSchedulesInDate.length > 0) {
        const eventSchedulesMapped = eventSchedulesInDate.map((es) => {
          const community = communities.find(
            (c) => c.id === es.communityId,
          ) as Community;

          return {
            type: 'event' as const,
            title: es.title,
            eventType: es.type,
            startTime: es.startTime,
            endTime: es.endTime,
            customLocation: es.customLocation,
            orientations: es.orientations,
            community: {
              id: es.communityId,
              name: community.name,
              address: community.address,
            },
          };
        });

        schedules.push(...eventSchedulesMapped);
      }

      calendar.push({
        date,
        dayOfWeek: moment(date).weekday(),
        dayOfWeekLabel: moment(date).format('dddd'),
        schedules,
      });
    }

    calendar = calendar.map((day) => ({
      ...day,
      schedules: day.schedules.sort((a, b) => {
        const aFirstTime = a.startTime.split(':').map(Number);
        const bFirstTime = b.startTime.split(':').map(Number);

        if (aFirstTime[0] === bFirstTime[0]) {
          return aFirstTime[1] - bFirstTime[1];
        }

        return aFirstTime[0] - bFirstTime[0];
      }),
    }));

    const exceptions = await this.massSchedulesExceptionsDaf.findMany({
      from: firstDateOfMonth.format('YYYY-MM-DD'),
      to: lastDateOfMonth.format('YYYY-MM-DD'),
    });

    // marca agendamentos em mesmo horário de exceções com status 'canceled'
    if (exceptions.length > 0) {
      calendar = calendar.map((day) => {
        const dayExceptions = exceptions.filter(
          (ex) => ex.exceptionDate === day.date,
        );

        if (dayExceptions.length === 0) {
          return day;
        }

        const updatedSchedules = day.schedules.map((schedule) => {
          const matchingException = dayExceptions.find(
            (ex) =>
              ex.startTime === schedule.startTime &&
              ex.scheduleId ===
                massSchedules.find(
                  (ms) =>
                    ms.communityId === schedule.community.id &&
                    ms.times.some((t) => t.startTime === schedule.startTime),
                )?.id,
          );

          if (matchingException) {
            return {
              ...schedule,
              status: 'canceled',
              cancellationReason: matchingException.reason,
            };
          }

          return schedule;
        });

        return {
          ...day,
          schedules: updatedSchedules,
        };
      });
    }

    // list after today inclusive
    const today = moment().startOf('day');
    calendar = calendar.filter((day) => moment(day.date).isSameOrAfter(today));

    return { calendar };
  }
}

function getFirstWeekdayOfMonth(month: number, year: number, weekday: number) {
  const date = moment({ year, month: month - 1, day: 1 });
  while (date.weekday() !== weekday) {
    date.add(1, 'day');
  }
  return date;
}

function isFirstWeekdayOfMonth(date: moment.Moment, weekday: number) {
  const firstWeekday = getFirstWeekdayOfMonth(
    date.month() + 1,
    date.year(),
    weekday,
  );
  return date.isSame(firstWeekday, 'day');
}
