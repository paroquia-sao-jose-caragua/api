import type { AppointmentService } from '@/entities/appointment-service';

export interface AppointmentServicesDAF {
  listAll(onlyActive?: boolean): Promise<AppointmentService[]>;
  findById(id: string): Promise<AppointmentService | null>;
  save(service: AppointmentService): Promise<void>;
}
