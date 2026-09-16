import { describe, beforeEach, it, expect } from 'vitest';
import { InMemoryAnnouncementsDAF } from '../../database/in-memory-announcements-daf';
import { InMemoryAttachmentsDAF } from '../../database/in-memory-attachments-daf';
import { CreateAnnouncementUseCase } from '@/use-cases/announcements/create-announcement';
import { EditAnnouncementUseCase } from '@/use-cases/announcements/edit-announcement';
import { DeleteAnnouncementUseCase } from '@/use-cases/announcements/delete-announcement';
import { ListAnnouncementsUseCase } from '@/use-cases/announcements/list-announcements';
import { ListActiveAnnouncementsUseCase } from '@/use-cases/announcements/list-active-announcements';
import { ReorderAnnouncementsUseCase } from '@/use-cases/announcements/reorder-announcements';

let announcementsDaf: InMemoryAnnouncementsDAF;
let attachmentsDaf: InMemoryAttachmentsDAF;
let createUseCase: CreateAnnouncementUseCase;
let editUseCase: EditAnnouncementUseCase;
let deleteUseCase: DeleteAnnouncementUseCase;
let listUseCase: ListAnnouncementsUseCase;
let listActiveUseCase: ListActiveAnnouncementsUseCase;
let reorderUseCase: ReorderAnnouncementsUseCase;

describe('Announcements Use Cases', () => {
  beforeEach(() => {
    announcementsDaf = new InMemoryAnnouncementsDAF();
    attachmentsDaf = new InMemoryAttachmentsDAF();
    createUseCase = new CreateAnnouncementUseCase(announcementsDaf, attachmentsDaf);
    editUseCase = new EditAnnouncementUseCase(announcementsDaf, attachmentsDaf);
    deleteUseCase = new DeleteAnnouncementUseCase(announcementsDaf);
    listUseCase = new ListAnnouncementsUseCase(announcementsDaf);
    listActiveUseCase = new ListActiveAnnouncementsUseCase(announcementsDaf);
    reorderUseCase = new ReorderAnnouncementsUseCase(announcementsDaf);

    attachmentsDaf.attachments.push({
      id: '01HKEY1234567890123456789A',
      filename: 'desktop.jpg',
      mimeType: 'image/jpeg',
      status: 'pending',
      storageProvider: 'r2',
      uploadedAt: new Date().toISOString(),
      userId: 'user-1',
    });

    attachmentsDaf.attachments.push({
      id: '01HKEY1234567890123456789B',
      filename: 'mobile.jpg',
      mimeType: 'image/jpeg',
      status: 'pending',
      storageProvider: 'r2',
      uploadedAt: new Date().toISOString(),
      userId: 'user-1',
    });
  });

  it('should create an announcement with responsive cover images', async () => {
    const { announcement } = await createUseCase.execute({
      badgeText: 'AVISO IMPORTANTE',
      title: 'Festa de São José 2026',
      description: 'Participe conosco',
      actionText: 'Ver programação',
      actionUrl: '/festa',
      coverDesktopId: '01HKEY1234567890123456789A',
      coverMobileId: '01HKEY1234567890123456789B',
      sortOrder: 1,
      active: true,
    });

    expect(announcement.id).toBeDefined();
    expect(announcement.title).toBe('Festa de São José 2026');
    expect(announcement.coverDesktopId).toBe('01HKEY1234567890123456789A');
    expect(announcement.coverMobileId).toBe('01HKEY1234567890123456789B');
  });

  it('should list active announcements only', async () => {
    await createUseCase.execute({
      title: 'Active Banner',
      description: 'Desc',
      coverDesktopId: '01HKEY1234567890123456789A',
      active: true,
    });

    await createUseCase.execute({
      title: 'Inactive Banner',
      description: 'Desc',
      coverDesktopId: '01HKEY1234567890123456789A',
      active: false,
    });

    const { announcements } = await listActiveUseCase.execute();
    expect(announcements).toHaveLength(1);
    expect(announcements[0].title).toBe('Active Banner');
  });

  it('should reorder announcements', async () => {
    const { announcement: a1 } = await createUseCase.execute({
      title: 'Banner 1',
      description: 'Desc',
      coverDesktopId: '01HKEY1234567890123456789A',
      sortOrder: 0,
    });

    const { announcement: a2 } = await createUseCase.execute({
      title: 'Banner 2',
      description: 'Desc',
      coverDesktopId: '01HKEY1234567890123456789A',
      sortOrder: 1,
    });

    await reorderUseCase.execute([a2.id, a1.id]);

    const { announcements } = await listUseCase.execute();
    expect(announcements[0].id).toBe(a2.id);
    expect(announcements[1].id).toBe(a1.id);
  });
});
