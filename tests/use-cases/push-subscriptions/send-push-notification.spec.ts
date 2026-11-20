import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryPushSubscriptionsDAF } from '../../database/in-memory-push-subscriptions-daf';
import { SendPushNotificationUseCase } from '@/use-cases/push-subscriptions/send-push-notification';
import type { PushSubscriptionEntity } from '@/entities/push-subscription';

describe('SendPushNotificationUseCase', () => {
  let pushSubsDaf: InMemoryPushSubscriptionsDAF;
  let sut: SendPushNotificationUseCase;

  const mockVapidPublicKey =
    'BG7yAjm7cEMvuOqjo5ST2sjkuih8fc-Cd4kXSKtFJX8Glp7_Yqgm_dJOZG8HsZv5-YTkP2_zE1m_0988l9kytI8';
  const mockVapidPrivateKey = 'nrcBMJr1k4E8B3zZ5GuPxhClNRIwieF3W0ZOPV-PDXw';
  const mockVapidSubject = 'mailto:contato@paroquiasaojosecaragua.org.br';

  const sub1: PushSubscriptionEntity = {
    id: '01SUB000000000000000000001',
    userId: '01USR000000000000000000001',
    userName: 'Secretária Maria',
    userEmail: 'secretaria@paroquia.org',
    userRole: 'secretary',
    origin: 'panel',
    deviceInfo: 'Chrome on macOS',
    endpoint: 'https://fcm.googleapis.com/fcm/send/sub1-endpoint',
    p256dh:
      'BPA-lIoDcP3wAAaMgzdeKIe03otMZpS05lqIDxgwlLJ6aUEQAEU5yrb0MOF2jskzb6iIANbV4x7sW64sbkHmOEQ',
    auth: 'l2Ve3YDiE6dMa5vdA9RVGQ',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  };

  const sub2: PushSubscriptionEntity = {
    id: '01SUB000000000000000000002',
    userId: '01USR000000000000000000002',
    userName: 'Pe. Marcelo',
    userEmail: 'padre@paroquia.org',
    userRole: 'pastoral_agent',
    origin: 'panel',
    deviceInfo: 'Safari on iOS',
    endpoint: 'https://web.push.apple.com/send/sub2-endpoint',
    p256dh:
      'BJBzJd88KGEeZto-unXyArVApng612-I9Wa5K9x6zfrPMakP-eWYpRMviuxJnn407eCAnpZyhV5ADyaWz6HsEUI',
    auth: '_cLfvchYdpbdA_ld2WOkmg',
    createdAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-02T10:00:00Z',
  };

  const sub3Public: PushSubscriptionEntity = {
    id: '01SUB000000000000000000003',
    userId: null,
    userName: null,
    userEmail: null,
    userRole: null,
    origin: 'site',
    deviceInfo: 'Chrome on Android',
    endpoint: 'https://fcm.googleapis.com/fcm/send/sub3-endpoint',
    p256dh:
      'BOqtb7WcCgPXNJq080qRiblRjhMG3Kq8xidJsTuq6IsZkXpnoYt8qidUXV0ghQPIyr_Z_bvLKyEihckvtaZrwL8',
    auth: 'M_tFfvuKhnvZ2ZqTuNj4fw',
    createdAt: '2026-10-03T10:00:00Z',
    updatedAt: '2026-10-03T10:00:00Z',
  };

  beforeEach(async () => {
    pushSubsDaf = new InMemoryPushSubscriptionsDAF();
    await pushSubsDaf.save(sub1);
    await pushSubsDaf.save(sub2);
    await pushSubsDaf.save(sub3Public);

    sut = new SendPushNotificationUseCase(
      pushSubsDaf,
      'http://localhost:3000',
      'http://localhost:3001',
      mockVapidSubject,
      mockVapidPublicKey,
      mockVapidPrivateKey,
    );
  });

  it('should deliver notification with VAPID authorization and AES-128-GCM encrypted payload', async () => {
    let capturedRequest: {
      endpoint: string;
      headers: Record<string, string>;
      body: any;
    } | null = null;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (endpoint, init) => {
        capturedRequest = {
          endpoint,
          headers: init.headers,
          body: init.body,
        };
        return new Response(null, { status: 201 });
      }),
    );

    const result = await sut.execute({
      targetId: sub2.id,
      payload: {
        title: 'Novo atendimento',
        body: 'Novo atendimento agendado na sua pauta.',
        url: '/minha-agenda/agenda',
      },
    });

    expect(result.sentCount).toBe(1);
    expect(result.failedCount).toBe(0);
    expect(capturedRequest).not.toBeNull();
    const req = capturedRequest!;
    expect(req.endpoint).toBe(sub2.endpoint);
    // VAPID headers generated
    expect(req.headers.authorization).toContain('vapid t=');
    expect(req.headers.authorization).toContain(`k=${mockVapidPublicKey}`);
    expect(req.headers['content-encoding']).toBe('aes128gcm');
    expect(req.headers['content-type']).toBe('application/octet-stream');
  });

  it('should filter notifications by targetRoles', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await sut.execute({
      targetRoles: ['secretary'],
      payload: {
        title: 'Aviso da Secretaria',
        body: 'Mensagem para a secretaria.',
      },
    });

    expect(result.sentCount).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      sub1.endpoint,
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('should filter notifications by targetUserIds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await sut.execute({
      targetUserIds: [sub2.userId!],
      payload: {
        title: 'Mensagem pessoal',
        body: 'Olá Pe. Marcelo.',
      },
    });

    expect(result.sentCount).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      sub2.endpoint,
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('should filter notifications by targetOrigin', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await sut.execute({
      targetOrigin: 'site',
      payload: {
        title: 'Aviso Paroquial',
        body: 'Aviso para visitantes do site.',
      },
    });

    expect(result.sentCount).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      sub3Public.endpoint,
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('should automatically delete expired subscriptions when push service returns 404 or 410', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (endpoint) => {
        if (endpoint === sub1.endpoint) {
          return new Response('Not Found', { status: 404 });
        }
        return new Response(null, { status: 201 });
      }),
    );

    const result = await sut.execute({
      payload: {
        title: 'Broadcast',
        body: 'Mensagem para todos',
      },
    });

    expect(result.sentCount).toBe(2);
    expect(result.failedCount).toBe(1);

    // sub1 should be deleted from DAF
    const sub1InDb = await pushSubsDaf.findById(sub1.id);
    expect(sub1InDb).toBeNull();

    // sub2 and sub3 should remain
    const sub2InDb = await pushSubsDaf.findById(sub2.id);
    expect(sub2InDb).not.toBeNull();
  });

  it('should handle network failures gracefully without throwing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Push gateway unreachable')),
    );

    const result = await sut.execute({
      targetId: sub1.id,
      payload: {
        title: 'Teste',
        body: 'Mensagem de teste',
      },
    });

    expect(result.sentCount).toBe(0);
    expect(result.failedCount).toBe(1);
  });

  it('should use fallback plain POST if VAPID keys are omitted', async () => {
    const sutWithoutVapid = new SendPushNotificationUseCase(
      pushSubsDaf,
      'http://localhost:3000',
      'http://localhost:3001',
    );

    let capturedInit: any = null;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (_endpoint, init) => {
        capturedInit = init;
        return new Response(null, { status: 201 });
      }),
    );

    const result = await sutWithoutVapid.execute({
      targetId: sub1.id,
      payload: {
        title: 'Plain Push',
        body: 'Without VAPID',
      },
    });

    expect(result.sentCount).toBe(1);
    expect(capturedInit.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(capturedInit.body).title).toBe('Plain Push');
  });
});
