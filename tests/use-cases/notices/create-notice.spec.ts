import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryNoticesDAF } from '../../database/in-memory-notices-daf';
import { InMemoryAttachmentsDAF } from '../../database/in-memory-attachments-daf';
import { CreateNoticeUseCase } from '@/use-cases/notices/create-notice';
import { AttachmentNotFoundError } from '@/use-cases/errors/attachment-not-found-error';

let noticesDaf: InMemoryNoticesDAF;
let attachmentsDaf: InMemoryAttachmentsDAF;
let sut: CreateNoticeUseCase;

describe('Create Notice Use Case', () => {
  beforeEach(() => {
    noticesDaf = new InMemoryNoticesDAF();
    attachmentsDaf = new InMemoryAttachmentsDAF();
    sut = new CreateNoticeUseCase(noticesDaf, attachmentsDaf);
  });

  it('should create a notice without an image', async () => {
    const { notice } = await sut.execute({
      title: 'Inscrições Catequese 2027',
      summary: 'Inscrições abertas na secretaria paroquial.',
      description: 'As inscrições estarão abertas de segunda a sexta.',
      variant: 'info',
      pinned: true,
      active: true,
    });

    expect(notice.id).toEqual(expect.any(String));
    expect(notice.title).toBe('Inscrições Catequese 2027');
    expect(notice.pinned).toBe(true);
    expect(noticesDaf.items).toHaveLength(1);
  });

  it('should create a notice with an attachment image and mark it attached', async () => {
    await attachmentsDaf.create({
      id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      filename: 'cartaz.png',
      mimeType: 'image/png',
      userId: 'user-1',
      storageProvider: 'r2',
      status: 'pending',
      uploadedAt: new Date().toISOString(),
    });

    const { notice } = await sut.execute({
      title: 'Festa de São José',
      description: 'Programação completa da novena.',
      variant: 'solemnity',
      imageId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    });

    expect(notice.imageId).toBe('01ARZ3NDEKTSV4RRFFQ69G5FAV');
    const attachment = await attachmentsDaf.findById('01ARZ3NDEKTSV4RRFFQ69G5FAV');
    expect(attachment?.status).toBe('attached');
  });

  it('should throw AttachmentNotFoundError when imageId does not exist', async () => {
    await expect(() =>
      sut.execute({
        title: 'Aviso com imagem inválida',
        description: 'Descrição do aviso.',
        imageId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      }),
    ).rejects.toBeInstanceOf(AttachmentNotFoundError);
  });
});
