import type { Appointment, AppointmentStatus } from '@/entities/appointment';
import type { AppointmentsDAF, AppointmentsFilters } from '@/services/database/appointments-daf';

export class InMemoryAppointmentsDAF implements AppointmentsDAF {
  public items: Appointment[] = [];

  async create(appointment: Appointment): Promise<void> {
    this.items.push(appointment);
  }

  async findById(id: string): Promise<Appointment | null> {
    const item = this.items.find((a) => a.id === id);
    return item || null;
  }

  async findByToken(token: string): Promise<Appointment | null> {
    const item = this.items.find((a) => a.accessToken === token);
    return item || null;
  }

  async list(filters?: AppointmentsFilters): Promise<Appointment[]> {
    return this.items.filter((item) => {
      if (filters?.agentId && item.agentId !== filters.agentId) return false;
      if (filters?.date && item.appointmentDate !== filters.date) return false;
      if (filters?.startDate && item.appointmentDate < filters.startDate) return false;
      if (filters?.endDate && item.appointmentDate > filters.endDate) return false;
      if (filters?.status && item.status !== filters.status) return false;
      return true;
    });
  }

  async countBySlot(agentId: string, date: string, startTime: string): Promise<number> {
    return this.items.filter(
      (a) =>
        a.agentId === agentId &&
        a.appointmentDate === date &&
        a.startTime === startTime &&
        a.status !== 'cancelled'
    ).length;
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    cancellationReason?: string | null,
    privateNotes?: string | null
  ): Promise<void> {
    const item = this.items.find((a) => a.id === id);
    if (item) {
      item.status = status;
      if (cancellationReason !== undefined) {
        item.cancellationReason = cancellationReason;
      }
      if (privateNotes !== undefined) {
        item.privatePastoralNotes = privateNotes;
      }
      item.updatedAt = new Date().toISOString();
    }
  }

  async cancelByToken(token: string, cancellationReason: string): Promise<void> {
    const item = this.items.find((a) => a.accessToken === token);
    if (item && item.status !== 'completed') {
      item.status = 'cancelled';
      item.cancellationReason = cancellationReason;
      item.updatedAt = new Date().toISOString();
    }
  }
}
