import { getAppContext } from '@/http/utils/getAppContext';
import { makeListPastoralAgentsUseCase } from '@/use-cases/factories/appointments/make-list-pastoral-agents-use-case';

export const listPastoralAgents: ControllerFn = async (c) => {
  const serviceId = c.req.query('serviceId');
  const listUseCase = makeListPastoralAgentsUseCase(c);
  const { agents } = await listUseCase.execute({
    onlyActive: true,
    serviceId,
  });

  return c.json({
    agents: agents.map((agent) => ({
      ...agent,
      photoUrl: agent.photoId ? `${c.env.S3_API_URL}/${agent.photoId}` : null,
    })),
  });
};
