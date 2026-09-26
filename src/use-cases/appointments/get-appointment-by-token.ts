import type { Appointment } from '@/entities/appointment';
import type { AppointmentsDAF } from '@/services/database/appointments-daf';
import { AppointmentNotFoundError } from '../errors/appointment-not-found-error';

interface GetAppointmentByTokenUseCaseRequest {
  token: string;
}

interface GetAppointmentByTokenUseCaseResponse {
  appointment: Appointment;
}

export class GetAppointmentByTokenUseCase {
  constructor(private appointmentsDAF: AppointmentsDAF) {}

  async execute({
    token,
  }: GetAppointmentByTokenUseCaseRequest): Promise<GetAppointmentByTokenUseCaseResponse> {
    const appointment = await this.appointmentsDAF.findByToken(token);

    if (!appointment) {
      throw new AppointmentNotFoundError();
    }

    return { appointment };
  }
}
