import { ulid } from 'serverless-crypto-utils/id-generation';
import type { AppointmentService, AppointmentServiceCategory } from '@/entities/appointment-service';
import type { AppointmentServicesDAF } from '@/services/database/appointment-services-daf';
import { ServiceNotFoundError } from '@/use-cases/errors/service-not-found-error';

interface SaveAppointmentServiceUseCaseRequest {
  id?: string;
  title: string;
  category: AppointmentServiceCategory;
  description?: string | null;
  defaultDurationMinutes?: number;
  requiresAddress?: boolean;
  active?: boolean;
}

interface SaveAppointmentServiceUseCaseResponse {
  service: AppointmentService;
}

export class SaveAppointmentServiceUseCase {
  constructor(private appointmentServicesDAF: AppointmentServicesDAF) {}

  async execute({
    id,
    title,
    category,
    description,
    defaultDurationMinutes = 30,
    requiresAddress = false,
    active = true,
  }: SaveAppointmentServiceUseCaseRequest): Promise<SaveAppointmentServiceUseCaseResponse> {
    const serviceId = id || ulid();

    if (id) {
      const existing = await this.appointmentServicesDAF.findById(id);
      if (!existing) {
        throw new ServiceNotFoundError();
      }
    }

    const service: AppointmentService = {
      id: serviceId,
      title: title.trim(),
      category,
      description: description?.trim() || null,
      defaultDurationMinutes,
      requiresAddress,
      active,
    };

    await this.appointmentServicesDAF.save(service);
    const saved = await this.appointmentServicesDAF.findById(serviceId);

    return { service: saved || service };
  }
}
