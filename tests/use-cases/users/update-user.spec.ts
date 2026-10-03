import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserDAF } from '@/../tests/database/in-memory-users-daf';
import { InMemoryPastoralAgentsDAF } from '@/../tests/database/in-memory-pastoral-agents-daf';
import { UpdateUserUseCase } from '@/use-cases/users/update-user';
import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error';
import { ResourceAlreadyExistsError } from '@/use-cases/errors/resource-already-exists-error';

describe('Update User Use Case', () => {
  let usersDaf: InMemoryUserDAF;
  let pastoralAgentsDaf: InMemoryPastoralAgentsDAF;
  let sut: UpdateUserUseCase;

  beforeEach(() => {
    usersDaf = new InMemoryUserDAF();
    pastoralAgentsDaf = new InMemoryPastoralAgentsDAF();
    sut = new UpdateUserUseCase(usersDaf, pastoralAgentsDaf);
  });

  it('should update user name and email successfully', async () => {
    const user = await usersDaf.create({
      id: 'user-1',
      name: 'João Antigo',
      email: 'joao.antigo@example.com',
      passwordHash: 'hash',
      role: 'secretary',
      status: 'active',
    });

    const result = await sut.execute({
      id: user.id,
      name: 'João Silva',
      email: 'joao.silva@example.com',
    });

    expect(result.user.name).toBe('João Silva');
    expect(result.user.email).toBe('joao.silva@example.com');

    const inDb = await usersDaf.findById(user.id);
    expect(inDb?.name).toBe('João Silva');
    expect(inDb?.email).toBe('joao.silva@example.com');
  });

  it('should allow updating name while keeping the same email', async () => {
    const user = await usersDaf.create({
      id: 'user-1',
      name: 'Maria Antiga',
      email: 'maria@example.com',
      passwordHash: 'hash',
      role: 'secretary',
      status: 'active',
    });

    const result = await sut.execute({
      id: user.id,
      name: 'Maria Nova',
      email: 'maria@example.com',
    });

    expect(result.user.name).toBe('Maria Nova');
    expect(result.user.email).toBe('maria@example.com');
  });

  it('should throw UserNotFoundError if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existent',
        name: 'Inexistente',
        email: 'inexistente@example.com',
      }),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('should throw ResourceAlreadyExistsError if email is taken by another user', async () => {
    await usersDaf.create({
      id: 'user-1',
      name: 'User 1',
      email: 'taken@example.com',
      passwordHash: 'hash',
      role: 'secretary',
      status: 'active',
    });

    const user2 = await usersDaf.create({
      id: 'user-2',
      name: 'User 2',
      email: 'user2@example.com',
      passwordHash: 'hash',
      role: 'secretary',
      status: 'active',
    });

    await expect(() =>
      sut.execute({
        id: user2.id,
        name: 'User 2 Modificado',
        email: 'taken@example.com',
      }),
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError);
  });

  it('should sync linked pastoral agent name and email when user is updated', async () => {
    const user = await usersDaf.create({
      id: 'user-agent-1',
      name: 'Pe. João Antigo',
      email: 'pe.joao@example.com',
      passwordHash: 'hash',
      role: 'pastoral_agent',
      status: 'active',
    });

    await pastoralAgentsDaf.save({
      id: 'agent-1',
      name: 'Pe. João Antigo',
      title: 'Pe.',
      actingRole: 'Vigário',
      userId: user.id,
      phone: '12999999999',
      email: 'pe.joao@example.com',
      communityId: null,
      photoId: null,
      acceptsAppointments: true,
      active: true,
    });

    await sut.execute({
      id: user.id,
      name: 'Pe. João Silva',
      email: 'pe.joaosilva@example.com',
    });

    const linkedAgent = await pastoralAgentsDaf.findByUserId(user.id);
    expect(linkedAgent?.name).toBe('Pe. João Silva');
    expect(linkedAgent?.email).toBe('pe.joaosilva@example.com');
  });
});
