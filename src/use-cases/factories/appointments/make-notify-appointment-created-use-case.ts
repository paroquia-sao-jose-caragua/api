import { D1AppointmentsDAF } from '@/services/database/d1/d1-appointments-daf';
import { D1PastoralAgentsDAF } from '@/services/database/d1/d1-pastoral-agents-daf';
import { NotifyAppointmentCreatedUseCase } from '@/use-cases/appointments/notify-appointment-created';
import { makeSendPushNotificationUseCase } from '@/use-cases/factories/push-subscriptions/make-send-push-notification-use-case';

export function makeNotifyAppointmentCreatedUseCase(c: DomainContext) {
  const agentsDaf = new D1PastoralAgentsDAF(c.env.DB);
  const appointmentsDaf = new D1AppointmentsDAF(c.env.DB);
  const sendPushUseCase = makeSendPushNotificationUseCase(c);

  return new NotifyAppointmentCreatedUseCase(
    agentsDaf,
    appointmentsDaf,
    sendPushUseCase,
  );
}
