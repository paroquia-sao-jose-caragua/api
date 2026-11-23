import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryNoticesDAF } from '../../database/in-memory-notices-daf';
import { InMemoryAttachmentsDAF } from '../../database/in-memory-attachments-daf';
import { EditNoticeUseCase } from '@/use-cases/notices/edit-notice';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';
import { AttachmentNotFoundError } from '@/use-cases/errors/attachment-not-found-error';

let noticesDaf: InMemoryNoticesDAF;
let attachmentsDaf: InMemoryAttachmentsDAF;
let sut: EditNoticeUseCase;

describe('Edit Notice Use Case', () => {
  beforeEach(() => {
    noticesDaf = new InMemoryNoticesDAF();
    attachmentsDaf = new InMemoryAttachmentsDAF();
    sut = new EditNoticeUseCase(noticesDaf, attachmentsDaf);
  });

  it('should edit an existing notice', async () => {
    await noticesDaf.create({
      id: 'notice-1',
      title: 'Título antigo',
      description: 'Descrição antiga',
      variant: 'info',
      pinned: false,
      active: true,
      createdAt: new Date().toISOString(),
    });

    const { notice } = await sut.execute({
      id: 'notice-1',
      title: 'Título atualizado',
      description: 'Descrição atualizada',
      variant: 'alert',
      pinned: true,
    });

    expect(notice.title).toBe('Título atualizado');
    expect(notice.variant).toBe('alert');
    expect(notice.pinned).toBe(true);
    expect(notice.updatedAt).toEqual(expect.any(String));
  });

  it('should throw ResourceNotFoundError if notice does not exist', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existent',
        title: 'Título',
        description: 'Descrição',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should throw AttachmentNotFoundError if new imageId does not exist', async () => {
    await noticesDaf.create({
      id: 'notice-1',
      title: 'Título',
      description: 'Descrição',
      variant: 'info',
      pinned: false,
      active: true,
      createdAt: new Date().toISOString(),
    });

    await expect(() =>
      sut.execute({
        id: 'notice-1',
        title: 'Título',
        description: 'Descrição',
        imageId: 'missing-image-id',
      }),
    ).rejects.toBeInstanceOf(AttachmentNotFoundError);
  });
});
