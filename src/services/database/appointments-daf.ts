import type { Appointment, AppointmentStatus } from '@/entities/appointment';

export interface AppointmentsFilters {
  agentId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: AppointmentStatus;
}

export interface AppointmentsDAF {
  create(appointment: Appointment): Promise<void>;
  findById(id: string): Promise<Appointment | null>;
  findByToken(token: string): Promise<Appointment | null>;
  list(filters?: AppointmentsFilters): Promise<Appointment[]>;
  countBySlot(agentId: string, date: string, startTime: string): Promise<number>;
  updateStatus(
    id: string,
    status: AppointmentStatus,
    cancellationReason?: string | null,
    privateNotes?: string | null
  ): Promise<void>;
  cancelByToken(token: string, cancellationReason: string): Promise<void>;
}
