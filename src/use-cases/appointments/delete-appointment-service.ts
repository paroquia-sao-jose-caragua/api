import type { AppointmentServicesDAF } from '@/services/database/appointment-services-daf';
import { ServiceNotFoundError } from '@/use-cases/errors/service-not-found-error';

interface DeleteAppointmentServiceUseCaseRequest {
  id: string;
}

export class DeleteAppointmentServiceUseCase {
  constructor(private appointmentServicesDAF: AppointmentServicesDAF) {}

  async execute({ id }: DeleteAppointmentServiceUseCaseRequest): Promise<void> {
    const service = await this.appointmentServicesDAF.findById(id);
    if (!service) {
      throw new ServiceNotFoundError();
    }

    await this.appointmentServicesDAF.delete(id);
  }
}
