import type { AppointmentsDAF } from '@/services/database/appointments-daf';
import { AppointmentNotFoundError } from '../errors/appointment-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

interface CancelAppointmentByTokenUseCaseRequest {
  token: string;
  cancellationReason: string;
}

interface CancelAppointmentByTokenUseCaseResponse {
  success: boolean;
}

export class CancelAppointmentByTokenUseCase {
  constructor(private appointmentsDAF: AppointmentsDAF) {}

  async execute({
    token,
    cancellationReason,
  }: CancelAppointmentByTokenUseCaseRequest): Promise<CancelAppointmentByTokenUseCaseResponse> {
    const appointment = await this.appointmentsDAF.findByToken(token);

    if (!appointment) {
      throw new AppointmentNotFoundError();
    }

    if (appointment.status === 'completed') {
      throw new NotAllowedError();
    }

    await this.appointmentsDAF.cancelByToken(token, cancellationReason.trim());

    return { success: true };
  }
}
