import { getAppContext } from '@/http/utils/getAppContext';
import {
  useSavePastoralAgentSchema,
  useSaveAgentAvailabilitiesSchema,
  useAddBlockedDateSchema,
} from '@/schemas/use-pastoral-agent-schema';
import {
  makeGetPastoralAgentUseCase,
  makeSavePastoralAgentUseCase,
  makeDeletePastoralAgentUseCase,
} from '@/use-cases/factories/appointments/make-manage-pastoral-agent-use-case';
import { makeManageAgentAvailabilitiesUseCase } from '@/use-cases/factories/appointments/make-manage-agent-availabilities-use-case';
import { PastoralAgentNotFoundError } from '@/use-cases/errors/pastoral-agent-not-found-error';

export const getPastoralAgent: ControllerFn = async (c) => {
  const { t } = getAppContext(c);
  const id = c.req.param('id');

  try {
    const useCase = makeGetPastoralAgentUseCase(c);
    const { agent } = await useCase.execute({ id });

    return c.json({
      agent: {
        ...agent,
        photoUrl: agent.photoId ? `${c.env.S3_API_URL}/${agent.photoId}` : null,
      },
    });
  } catch (err) {
    if (err instanceof PastoralAgentNotFoundError) {
      return c.json({ error: t('error-pastoral-agent-not-found') }, 404);
    }
    throw err;
  }
};

export const deletePastoralAgent: ControllerFn = async (c) => {
  const { t } = getAppContext(c);
  const id = c.req.param('id');

  try {
    const useCase = makeDeletePastoralAgentUseCase(c);
    await useCase.execute({ id });

    return c.json({ message: 'Pastoral agent deleted successfully' });
  } catch (err) {
    if (err instanceof PastoralAgentNotFoundError) {
      return c.json({ error: t('error-pastoral-agent-not-found') }, 404);
    }
    throw err;
  }
};

export const savePastoralAgent: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);
  const id = c.req.param('id');
  const schema = useSavePastoralAgentSchema(t);
  const data = schema.parse(inputs);

  const useCase = makeSavePastoralAgentUseCase(c);
  const { agent } = await useCase.execute({
    id,
    ...data,
  });

  return c.json(
    {
      agent: {
        ...agent,
        photoUrl: agent.photoId ? `${c.env.S3_API_URL}/${agent.photoId}` : null,
      },
    },
    id ? 200 : 201
  );
};

import { D1PastoralAgentsDAF } from '@/services/database/d1/d1-pastoral-agents-daf';

async function checkAgentOwnership(c: DomainContext, agentId: string): Promise<boolean> {
  const { user } = getAppContext(c);
  if (user.role === 'admin' || user.role === 'secretary') {
    return true;
  }
  if (user.role === 'pastoral_agent') {
    const daf = new D1PastoralAgentsDAF(c.env.DB);
    const agent = await daf.findByUserId(user.id);
    return Boolean(agent && agent.id === agentId);
  }
  return false;
}

export const getAgentAvailabilities: ControllerFn = async (c) => {
  const { t } = getAppContext(c);
  const id = c.req.param('id');

  if (!(await checkAgentOwnership(c, id))) {
    return c.json({ error: t('error-not-allowed') }, 403);
  }

  const useCase = makeManageAgentAvailabilitiesUseCase(c);
  const availabilities = await useCase.listAvailabilities(id);

  return c.json({ availabilities });
};

export const saveAgentAvailabilities: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);
  const id = c.req.param('id');

  if (!(await checkAgentOwnership(c, id))) {
    return c.json({ error: t('error-not-allowed') }, 403);
  }

  const schema = useSaveAgentAvailabilitiesSchema(t);
  const { availabilities } = schema.parse(inputs);

  const useCase = makeManageAgentAvailabilitiesUseCase(c);
  await useCase.saveAvailabilities(id, availabilities);

  return c.json({ message: 'Availabilities saved successfully' });
};

export const getAgentBlockedDates: ControllerFn = async (c) => {
  const { t } = getAppContext(c);
  const id = c.req.param('id');

  if (!(await checkAgentOwnership(c, id))) {
    return c.json({ error: t('error-not-allowed') }, 403);
  }

  const useCase = makeManageAgentAvailabilitiesUseCase(c);
  const blockedDates = await useCase.listBlockedDates(id);

  return c.json({ blockedDates });
};

export const addAgentBlockedDate: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);
  const id = c.req.param('id');

  if (!(await checkAgentOwnership(c, id))) {
    return c.json({ error: t('error-not-allowed') }, 403);
  }

  const schema = useAddBlockedDateSchema(t);
  const data = schema.parse(inputs);

  const useCase = makeManageAgentAvailabilitiesUseCase(c);
  const blockedDate = await useCase.addBlockedDate(
    id,
    data.blockedDate,
    data.startTime,
    data.endTime,
    data.reason
  );

  return c.json({ blockedDate }, 201);
};

export const removeAgentBlockedDate: ControllerFn = async (c) => {
  const blockId = c.req.param('blockId');
  const useCase = makeManageAgentAvailabilitiesUseCase(c);
  await useCase.removeBlockedDate(blockId);

  return c.json({ message: 'Blocked date removed successfully' });
};
