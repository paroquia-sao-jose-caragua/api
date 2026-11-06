import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryCommunitiesDAF } from '@/../tests/database/in-memory-communities-daf';
import { InMemoryMassSchedulesDAF } from '@/../tests/database/in-memory-mass-schedules-daf';
import { InMemoryParishContactDAF } from '@/../tests/database/in-memory-parish-contact-daf';
import { ListCommunitiesUseCase } from '@/use-cases/communities/list-communities';

let communitiesDaf: InMemoryCommunitiesDAF;
let massSchedulesDaf: InMemoryMassSchedulesDAF;
let parishContactDaf: InMemoryParishContactDAF;
let sut: ListCommunitiesUseCase;

describe('List Communities Use Case', () => {
  beforeEach(() => {
    communitiesDaf = new InMemoryCommunitiesDAF();
    massSchedulesDaf = new InMemoryMassSchedulesDAF();
    parishContactDaf = new InMemoryParishContactDAF();
    sut = new ListCommunitiesUseCase(
      communitiesDaf,
      massSchedulesDaf,
      parishContactDaf,
    );
  });

  it('should be able to list communities with their active mass schedules', async () => {
    await communitiesDaf.create({
      id: 'community-1',
      name: 'Matriz São José',
      slug: 'matriz-sao-jose',
      type: 'parish_church',
      address: 'Rua Principal, 123',
      coverId: 'cover-1',
      createdAt: new Date().toISOString(),
    });

    await communitiesDaf.create({
      id: 'community-2',
      name: 'Capela Sagrado Coração',
      slug: 'capela-sagrado-coracao',
      type: 'chapel',
      address: 'Rua Secundária, 456',
      coverId: 'cover-2',
      createdAt: new Date().toISOString(),
    });

    await massSchedulesDaf.create({
      id: 'schedule-1',
      communityId: 'community-1',
      type: 'ordinary',
      recurrenceType: 'weekly',
      dayOfWeek: 0,
      isPrecept: true,
      active: true,
      startTime: '08:00',
      createdAt: new Date().toISOString(),
    });

    await massSchedulesDaf.create({
      id: 'schedule-2',
      communityId: 'community-1',
      type: 'ordinary',
      recurrenceType: 'weekly',
      dayOfWeek: 3,
      isPrecept: false,
      active: true, // Active ordinary Wednesday should be included
      startTime: '19:30',
      createdAt: new Date().toISOString(),
    });

    await massSchedulesDaf.create({
      id: 'schedule-3',
      communityId: 'community-1',
      type: 'ordinary',
      recurrenceType: 'weekly',
      dayOfWeek: 5,
      isPrecept: false,
      active: false, // Inactive should be filtered out
      startTime: '19:00',
      createdAt: new Date().toISOString(),
    });

    await massSchedulesDaf.create({
      id: 'schedule-4',
      communityId: 'community-1',
      type: 'devotional',
      recurrenceType: 'monthly',
      dayOfMonth: 19,
      isPrecept: false,
      active: true, // Devotional should be filtered out in home list
      startTime: '19:30',
      createdAt: new Date().toISOString(),
    });

    await massSchedulesDaf.create({
      id: 'schedule-5',
      communityId: 'community-1',
      type: 'solemnity',
      recurrenceType: 'monthly',
      dayOfMonth: 25,
      isPrecept: true,
      active: true, // Solemnity should be filtered out in home list
      startTime: '10:00',
      createdAt: new Date().toISOString(),
    });

    const { communities } = await sut.execute();

    expect(communities).toHaveLength(2);
    expect(communities[0].massSchedules).toHaveLength(2);
    expect(communities[0].massSchedules?.[0].id).toBe('schedule-1');
    expect(communities[0].massSchedules?.[0].startTime).toBe('08:00');
    expect(communities[0].massSchedules?.[1].id).toBe('schedule-2');
    expect(communities[0].massSchedules?.[1].startTime).toBe('19:30');
    expect(communities[1].massSchedules).toHaveLength(0);
  });

  it('should provide phone, email, and officeHours from parish contact information', async () => {
    await parishContactDaf.save({
      id: 'primary',
      phone: '(12) 3883-4888',
      email: 'contato@paroquiasaojosecaragua.org.br',
      officeHours: 'Segunda a Sexta: 08h às 17h',
      updatedAt: new Date().toISOString(),
    });

    await communitiesDaf.create({
      id: 'community-1',
      name: 'Capela Santa Edwiges',
      slug: 'capela-santa-edwiges',
      type: 'chapel',
      address: 'Avenida Principal, 100',
      coverId: 'cover-1',
      createdAt: new Date().toISOString(),
    });

    const { communities } = await sut.execute();

    expect(communities).toHaveLength(1);
    expect(communities[0].phone).toBe('(12) 3883-4888');
    expect(communities[0].email).toBe('contato@paroquiasaojosecaragua.org.br');
    expect(communities[0].officeHours).toBe('Segunda a Sexta: 08h às 17h');
  });

  it('should have undefined phone, email, and officeHours when parish contact is not defined', async () => {
    await communitiesDaf.create({
      id: 'community-1',
      name: 'Capela Nossa Senhora',
      slug: 'capela-nossa-senhora',
      type: 'chapel',
      address: 'Rua das Flores, 50',
      coverId: 'cover-1',
      createdAt: new Date().toISOString(),
    });

    const { communities } = await sut.execute();

    expect(communities).toHaveLength(1);
    expect(communities[0].phone).toBeUndefined();
    expect(communities[0].email).toBeUndefined();
    expect(communities[0].officeHours).toBeUndefined();
  });
});
