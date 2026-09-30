import { getAppContext } from "@/http/utils/getAppContext";
import { makeListPushSubscriptionsUseCase } from "@/use-cases/factories/push-subscriptions/make-list-push-subscriptions-use-case";

export const listPushSubscriptions: ControllerFn = async (c) => {
  getAppContext(c);
  const originParam = c.req.query("origin");
  const origin =
    originParam === "site" || originParam === "panel"
      ? originParam
      : undefined;

  const listUseCase = makeListPushSubscriptionsUseCase(c);
  const { subscriptions } = await listUseCase.execute({ origin });

  return c.json({ subscriptions }, 200);
};
