import type { AppointmentService } from '@/entities/appointment-service';
import type { AppointmentServicesDAF } from '@/services/database/appointment-services-daf';

interface ListAppointmentServicesUseCaseRequest {
  onlyActive?: boolean;
}

interface ListAppointmentServicesUseCaseResponse {
  services: AppointmentService[];
}

export class ListAppointmentServicesUseCase {
  constructor(private appointmentServicesDAF: AppointmentServicesDAF) {}

  async execute({
    onlyActive = true,
  }: ListAppointmentServicesUseCaseRequest = {}): Promise<ListAppointmentServicesUseCaseResponse> {
    const services = await this.appointmentServicesDAF.listAll(onlyActive);
    return { services };
  }
}
