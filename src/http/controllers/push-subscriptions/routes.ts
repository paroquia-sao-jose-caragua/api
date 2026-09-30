import { Hono } from "hono";
import { verifyToken } from "@/http/middlewares/verifyToken";
import { subscribePushNotification } from "./subscribe";
import { listPushSubscriptions } from "./list";
import { deletePushSubscription } from "./delete";
import { sendTestPushNotification } from "./send-test";

const app = new Hono().basePath("/push-subscriptions");

// Public endpoint to register browser subscriptions
app.post("/", subscribePushNotification);

// Protected admin endpoints for device management
app.use("*", verifyToken);
app.get("/", listPushSubscriptions);
app.delete("/:id", deletePushSubscription);
app.post("/test", sendTestPushNotification);

export { app as pushSubscriptionsRoutes };
