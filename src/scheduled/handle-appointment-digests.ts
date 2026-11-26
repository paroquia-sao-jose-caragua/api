import { D1AppointmentsDAF } from '@/services/database/d1/d1-appointments-daf';
import { D1PastoralAgentsDAF } from '@/services/database/d1/d1-pastoral-agents-daf';
import { D1PushSubscriptionsDAF } from '@/services/database/d1/d1-push-subscriptions-daf';
import { SendScheduledAppointmentDigestsUseCase } from '@/use-cases/appointments/send-scheduled-appointment-digests';
import { SendPushNotificationUseCase } from '@/use-cases/push-subscriptions/send-push-notification';
import { log } from '@/services/log';

/**
 * Cron schedule mapping (UTC -> America/Sao_Paulo UTC-3):
 * - "0 12 * * 2-5" -> Tue-Fri 09:00 BRT (Secretariat morning opening)
 * - "0 17 * * 2-5" -> Tue-Fri 14:00 BRT (Secretariat afternoon opening)
 * - "0 11 * * 6"   -> Sat     08:00 BRT (Secretariat Saturday opening)
 * - "0 20 * * 2-5" -> Tue-Fri 17:00 BRT (Pastoral agent / Padre daily confirmed digest)
 */
const AGENT_DAILY_DIGEST_CRON = '0 20 * * 2-5';

export async function handleScheduledNotifications(
  controller: ScheduledController,
  env: Bindings,
): Promise<void> {
  const appointmentsDaf = new D1AppointmentsDAF(env.DB);
  const agentsDaf = new D1PastoralAgentsDAF(env.DB);
  const pushSubscriptionsDaf = new D1PushSubscriptionsDAF(env.DB);

  const sendPushUseCase = new SendPushNotificationUseCase(
    pushSubscriptionsDaf,
    env.SITE_BASE_URL || 'http://localhost:3000',
    env.PANEL_BASE_URL || 'http://localhost:3001',
    env.VAPID_SUBJECT || 'mailto:contato@paroquiasaojosecaragua.org.br',
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
  );

  const digestUseCase = new SendScheduledAppointmentDigestsUseCase(
    appointmentsDaf,
    agentsDaf,
    sendPushUseCase,
  );

  const now = new Date(controller.scheduledTime || Date.now());

  try {
    if (controller.cron === AGENT_DAILY_DIGEST_CRON) {
      await digestUseCase.runAgentDailyDigest(now);
      return;
    }

    await digestUseCase.runSecretariatDigest(now);
  } catch (error) {
    await log({
      env,
      data: {
        feature: 'push_notification',
        action: 'scheduled_appointment_digest',
        cron: controller.cron,
        scheduledTime: now.toISOString(),
      },
      error,
    });
  }
}
