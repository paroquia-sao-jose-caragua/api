import type { AppointmentService } from '@/entities/appointment-service';
import type { AppointmentServicesDAF } from '@/services/database/appointment-services-daf';

export class InMemoryAppointmentServicesDAF implements AppointmentServicesDAF {
  public items: AppointmentService[] = [];

  async listAll(onlyActive = true): Promise<AppointmentService[]> {
    return this.items.filter((item) => (onlyActive ? item.active : true));
  }

  async findById(id: string): Promise<AppointmentService | null> {
    const service = this.items.find((item) => item.id === id);
    return service || null;
  }

  async save(service: AppointmentService): Promise<void> {
    const index = this.items.findIndex((item) => item.id === service.id);
    if (index >= 0) {
      this.items[index] = service;
    } else {
      this.items.push(service);
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}

