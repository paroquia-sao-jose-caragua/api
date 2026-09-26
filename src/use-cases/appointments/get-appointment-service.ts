import type { AppointmentService } from '@/entities/appointment-service';
import type { AppointmentServicesDAF } from '@/services/database/appointment-services-daf';
import { ServiceNotFoundError } from '@/use-cases/errors/service-not-found-error';

interface GetAppointmentServiceUseCaseRequest {
  id: string;
}

interface GetAppointmentServiceUseCaseResponse {
  service: AppointmentService;
}

export class GetAppointmentServiceUseCase {
  constructor(private appointmentServicesDAF: AppointmentServicesDAF) {}

  async execute({ id }: GetAppointmentServiceUseCaseRequest): Promise<GetAppointmentServiceUseCaseResponse> {
    const service = await this.appointmentServicesDAF.findById(id);
    if (!service) {
      throw new ServiceNotFoundError();
    }

    return { service };
  }
}
