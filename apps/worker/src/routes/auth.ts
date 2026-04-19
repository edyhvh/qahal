import { Hono } from "hono";
import { telegramVerifyRequestSchema } from "@qahal/shared";
import type { Bindings } from "../types/env";
import { verifyTelegramInitData } from "../services/telegramAuth";

export const authRoute = new Hono<{ Bindings: Bindings }>();

authRoute.post("/telegram/verify", async (c) => {
  const payload = await c.req.json().catch(() => null);
  const parsed = telegramVerifyRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return c.json({ ok: false, error: "invalid_payload" }, 400);
  }

  const maxAgeSeconds = Number(c.env.INITDATA_MAX_AGE_SECONDS ?? "300");
  const result = await verifyTelegramInitData({
    initData: parsed.data.initData,
    botToken: c.env.TELEGRAM_BOT_TOKEN,
    maxAgeSeconds
  });

  if (!result.valid) {
    return c.json({ ok: false, error: result.reason ?? "invalid_init_data" }, 401);
  }

  return c.json({
    ok: true,
    user: result.user
      ? {
          telegramId: result.user.id,
          username: result.user.username,
          firstName: result.user.first_name,
          lastName: result.user.last_name,
          photoUrl: result.user.photo_url,
          languageCode: result.user.language_code
        }
      : null
  });
});
