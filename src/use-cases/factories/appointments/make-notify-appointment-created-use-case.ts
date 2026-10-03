import { D1PastoralAgentsDAF } from '@/services/database/d1/d1-pastoral-agents-daf';
import { makeSendPushNotificationUseCase } from '@/use-cases/factories/push-subscriptions/make-send-push-notification-use-case';
import { NotifyAppointmentCreatedUseCase } from '@/use-cases/appointments/notify-appointment-created';

export function makeNotifyAppointmentCreatedUseCase(c: DomainContext) {
  const agentsDaf = new D1PastoralAgentsDAF(c.env.DB);
  const sendPushUseCase = makeSendPushNotificationUseCase(c);

  return new NotifyAppointmentCreatedUseCase(agentsDaf, sendPushUseCase);
}
