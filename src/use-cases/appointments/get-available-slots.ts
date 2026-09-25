import type { PastoralAgentsDAF } from '@/services/database/pastoral-agents-daf';
import type { AgentAvailabilitiesDAF } from '@/services/database/agent-availabilities-daf';
import type { AppointmentsDAF } from '@/services/database/appointments-daf';
import type { AppointmentServicesDAF } from '@/services/database/appointment-services-daf';
import type { AppointmentSettingsDAF } from '@/services/database/appointment-settings-daf';
import { PastoralAgentNotFoundError } from '../errors/pastoral-agent-not-found-error';
import { ServiceNotFoundError } from '../errors/service-not-found-error';
import { AppointmentsDisabledError } from '../errors/appointments-disabled-error';

export interface AvailableSlot {
  startTime: string; // "14:00"
  endTime: string; // "14:30"
  agentId: string;
  communityId: string | null;
}

interface GetAvailableSlotsUseCaseRequest {
  agentId: string;
  date: string; // "YYYY-MM-DD"
  serviceId?: string;
}

interface GetAvailableSlotsUseCaseResponse {
  date: string;
  dayOfWeek: number;
  slots: AvailableSlot[];
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export class GetAvailableSlotsUseCase {
  constructor(
    private pastoralAgentsDAF: PastoralAgentsDAF,
    private agentAvailabilitiesDAF: AgentAvailabilitiesDAF,
    private appointmentsDAF: AppointmentsDAF,
    private appointmentServicesDAF: AppointmentServicesDAF,
    private appointmentSettingsDAF?: AppointmentSettingsDAF
  ) {}

  async execute({
    agentId,
    date,
    serviceId,
  }: GetAvailableSlotsUseCaseRequest): Promise<GetAvailableSlotsUseCaseResponse> {
    if (this.appointmentSettingsDAF) {
      const settings = await this.appointmentSettingsDAF.get();
      if (!settings.enabled) {
        throw new AppointmentsDisabledError();
      }
    }

    const agent = await this.pastoralAgentsDAF.findById(agentId);
    if (!agent || !agent.active || !agent.acceptsAppointments) {
      throw new PastoralAgentNotFoundError();
    }

    let slotDuration = 30;
    if (serviceId) {
      const service = await this.appointmentServicesDAF.findById(serviceId);
      if (!service) {
        throw new ServiceNotFoundError();
      }
      slotDuration = service.defaultDurationMinutes;
    }

    // Determine Day of Week (0-6)
    const [year, month, day] = date.split('-').map(Number);
    const dateUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const dayOfWeek = dateUtc.getUTCDay();

    // Check today date and current time in America/Sao_Paulo
    const nowBrazilStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());

    // format: "YYYY-MM-DD, HH:mm" or "YYYY-MM-DD HH:mm"
    const [todayDatePart, nowTimePart] = nowBrazilStr.split(/,?\s+/);
    const isPastDate = date < todayDatePart;
    const isToday = date === todayDatePart;
    const currentMinutesNow = nowTimePart ? timeToMinutes(nowTimePart) : 0;

    if (isPastDate) {
      return { date, dayOfWeek, slots: [] };
    }

    // Check blocked dates
    const blockedDates = await this.agentAvailabilitiesDAF.listBlockedDates(
      agentId,
      date,
      date
    );

    const isWholeDayBlocked = blockedDates.some((b) => !b.startTime);
    if (isWholeDayBlocked) {
      return { date, dayOfWeek, slots: [] };
    }

    // Get availabilities for this day of week
    const availabilities = await this.agentAvailabilitiesDAF.listByAgentAndDay(
      agentId,
      dayOfWeek
    );

    if (!availabilities || availabilities.length === 0) {
      return { date, dayOfWeek, slots: [] };
    }

    // Get existing appointments for this agent on this date
    const bookedAppointments = await this.appointmentsDAF.list({
      agentId,
      date,
    });

    const activeBookings = bookedAppointments.filter(
      (a) => a.status !== 'cancelled'
    );

    const slots: AvailableSlot[] = [];

    for (const avail of availabilities) {
      const windowStart = timeToMinutes(avail.startTime);
      const windowEnd = timeToMinutes(avail.endTime);
      const duration = slotDuration || avail.slotDurationMinutes || 30;

      for (let time = windowStart; time + duration <= windowEnd; time += duration) {
        const slotStartStr = minutesToTime(time);
        const slotEndStr = minutesToTime(time + duration);

        // If today, filter out times earlier than now + 30 mins
        if (isToday && time <= currentMinutesNow + 30) {
          continue;
        }

        // Check if slot overlaps with partial blocked dates
        const isBlocked = blockedDates.some((b) => {
          if (!b.startTime || !b.endTime) return false;
          const bStart = timeToMinutes(b.startTime);
          const bEnd = timeToMinutes(b.endTime);
          return time < bEnd && time + duration > bStart;
        });

        if (isBlocked) {
          continue;
        }

        // Check if slot overlaps with an existing appointment
        const isBooked = activeBookings.some((bk) => {
          const bkStart = timeToMinutes(bk.startTime);
          const bkEnd = timeToMinutes(bk.endTime);
          return time < bkEnd && time + duration > bkStart;
        });

        if (isBooked) {
          continue;
        }

        slots.push({
          startTime: slotStartStr,
          endTime: slotEndStr,
          agentId,
          communityId: avail.communityId,
        });
      }
    }

    return {
      date,
      dayOfWeek,
      slots,
    };
  }
}
