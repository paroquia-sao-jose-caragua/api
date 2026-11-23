import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryNoticesDAF } from '../../database/in-memory-notices-daf';
import { ListActiveNoticesUseCase } from '@/use-cases/notices/list-active-notices';

let noticesDaf: InMemoryNoticesDAF;
let sut: ListActiveNoticesUseCase;

describe('List Active Notices Use Case', () => {
  beforeEach(() => {
    noticesDaf = new InMemoryNoticesDAF();
    sut = new ListActiveNoticesUseCase(noticesDaf);
  });

  it('should return only active notices within valid schedule window', async () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const future = new Date(Date.now() + 86400000).toISOString();

    await noticesDaf.create({
      id: 'active-valid',
      title: 'Aviso ativo',
      description: 'Válido',
      variant: 'info',
      pinned: false,
      active: true,
      startsAt: past,
      endsAt: future,
      createdAt: new Date().toISOString(),
    });

    await noticesDaf.create({
      id: 'inactive',
      title: 'Aviso inativo',
      description: 'Inativo',
      variant: 'info',
      pinned: false,
      active: false,
      createdAt: new Date().toISOString(),
    });

    await noticesDaf.create({
      id: 'expired',
      title: 'Aviso expirado',
      description: 'Expirado',
      variant: 'alert',
      pinned: true,
      active: true,
      endsAt: past,
      createdAt: new Date().toISOString(),
    });

    await noticesDaf.create({
      id: 'scheduled',
      title: 'Aviso futuro',
      description: 'Agendado',
      variant: 'solemnity',
      pinned: false,
      active: true,
      startsAt: future,
      createdAt: new Date().toISOString(),
    });

    const { notices } = await sut.execute();
    expect(notices).toHaveLength(1);
    expect(notices[0].id).toBe('active-valid');
  });
});
