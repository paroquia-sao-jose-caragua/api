import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryNoticesDAF } from '../../database/in-memory-notices-daf';
import { GetNoticeUseCase } from '@/use-cases/notices/get-notice';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';

let noticesDaf: InMemoryNoticesDAF;
let sut: GetNoticeUseCase;

describe('Get Notice Use Case', () => {
  beforeEach(() => {
    noticesDaf = new InMemoryNoticesDAF();
    sut = new GetNoticeUseCase(noticesDaf);
  });

  it('should return an existing notice', async () => {
    await noticesDaf.create({
      id: 'notice-1',
      title: 'Aviso Paroquial',
      description: 'Detalhes completos',
      variant: 'info',
      pinned: false,
      active: true,
      createdAt: new Date().toISOString(),
    });

    const { notice } = await sut.execute('notice-1');
    expect(notice.id).toBe('notice-1');
    expect(notice.title).toBe('Aviso Paroquial');
  });

  it('should throw ResourceNotFoundError if notice does not exist', async () => {
    await expect(() => sut.execute('non-existent')).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
