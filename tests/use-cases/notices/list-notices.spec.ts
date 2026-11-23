import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryNoticesDAF } from '../../database/in-memory-notices-daf';
import { ListNoticesUseCase } from '@/use-cases/notices/list-notices';

let noticesDaf: InMemoryNoticesDAF;
let sut: ListNoticesUseCase;

describe('List Notices Use Case', () => {
  beforeEach(() => {
    noticesDaf = new InMemoryNoticesDAF();
    sut = new ListNoticesUseCase(noticesDaf);
  });

  it('should list all notices ordered by pinned then createdAt desc', async () => {
    await noticesDaf.create({
      id: 'notice-1',
      title: 'Normal recente',
      description: 'Desc',
      variant: 'info',
      pinned: false,
      active: true,
      createdAt: '2026-11-20T10:00:00.000Z',
    });

    await noticesDaf.create({
      id: 'notice-2',
      title: 'Fixado antigo',
      description: 'Desc',
      variant: 'alert',
      pinned: true,
      active: false,
      createdAt: '2026-11-10T10:00:00.000Z',
    });

    const { notices } = await sut.execute();
    expect(notices).toHaveLength(2);
    expect(notices[0].id).toBe('notice-2');
    expect(notices[1].id).toBe('notice-1');
  });
});
