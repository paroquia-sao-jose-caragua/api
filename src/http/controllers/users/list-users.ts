import { getAppContext } from '@/http/utils/getAppContext';
import { useListUsersQueriesSchema } from '@/schemas/use-list-users-queries-schema';
import { makeListUsersUseCase } from '@/use-cases/factories/users/make-list-users-use-case';

export const listUsers: ControllerFn = async (c) => {
  const { t } = getAppContext(c);

  const querySchema = useListUsersQueriesSchema(t);
  const queries = querySchema.parse(c.req.query());

  const listUsersUseCase = makeListUsersUseCase(c);
  const result = await listUsersUseCase.execute(queries);

  return c.json(result);
};
