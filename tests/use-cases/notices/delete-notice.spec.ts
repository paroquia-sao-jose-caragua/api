import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryNoticesDAF } from '../../database/in-memory-notices-daf';
import { DeleteNoticeUseCase } from '@/use-cases/notices/delete-notice';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';

let noticesDaf: InMemoryNoticesDAF;
let sut: DeleteNoticeUseCase;

describe('Delete Notice Use Case', () => {
  beforeEach(() => {
    noticesDaf = new InMemoryNoticesDAF();
    sut = new DeleteNoticeUseCase(noticesDaf);
  });

  it('should delete an existing notice', async () => {
    await noticesDaf.create({
      id: 'notice-1',
      title: 'Aviso',
      description: 'Descrição',
      variant: 'info',
      pinned: false,
      active: true,
      createdAt: new Date().toISOString(),
    });

    await sut.execute('notice-1');
    expect(noticesDaf.items).toHaveLength(0);
  });

  it('should throw ResourceNotFoundError if notice does not exist', async () => {
    await expect(() => sut.execute('non-existent')).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
