import { getAppContext } from '@/http/utils/getAppContext';
import { makeListAppointmentsUseCase } from '@/use-cases/factories/appointments/make-list-appointments-use-case';

export const listAppointments: ControllerFn = async (c) => {
  const { user } = getAppContext(c);
  const agentId = c.req.query('agentId');
  const date = c.req.query('date');
  const startDate = c.req.query('startDate');
  const endDate = c.req.query('endDate');
  const status = c.req.query('status') as any;

  const useCase = makeListAppointmentsUseCase(c);
  const { appointments } = await useCase.execute({
    userRole: user.role,
    userId: user.id,
    agentId,
    date,
    startDate,
    endDate,
    status,
  });

  return c.json({
    appointments: appointments.map((a) => ({
      ...a,
      agent: a.agent
        ? {
            ...a.agent,
            photoUrl: a.agent.photoId
              ? `${c.env.S3_API_URL}/${a.agent.photoId}`
              : null,
          }
        : null,
    })),
  });
};
