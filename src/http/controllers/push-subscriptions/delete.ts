import { getAppContext } from "@/http/utils/getAppContext";
import { makeDeletePushSubscriptionUseCase } from "@/use-cases/factories/push-subscriptions/make-delete-push-subscription-use-case";

export const deletePushSubscription: ControllerFn = async (c) => {
  getAppContext(c);
  const id = c.req.param("id");

  const deleteUseCase = makeDeletePushSubscriptionUseCase(c);
  await deleteUseCase.execute({ id });

  return c.json({ success: true }, 200);
};
