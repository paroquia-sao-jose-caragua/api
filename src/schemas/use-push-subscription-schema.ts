import type { TranslatorFn } from "@/dictionaries";
import * as z from "zod";

export const useSubscribePushSchema = (t: TranslatorFn) => {
  return z.object({
    userName: z.string().max(255).optional().nullable(),
    userId: z.string().max(50).optional().nullable(),
    origin: z.enum(["site", "panel"]).default("site"),
    deviceInfo: z.string().max(255).optional().nullable(),
    endpoint: z.string().min(1, t("required-field")),
    keys: z.object({
      p256dh: z.string().min(1, t("required-field")),
      auth: z.string().min(1, t("required-field")),
    }),
  });
};

export const useSendPushNotificationSchema = (t: TranslatorFn) => {
  return z.object({
    title: z.string().min(1, t("required-field")).max(255),
    body: z.string().min(1, t("required-field")),
    url: z.string().optional().nullable(),
    targetId: z.string().optional().nullable(),
    targetOrigin: z.enum(["site", "panel"]).optional().nullable(),
  });
};
