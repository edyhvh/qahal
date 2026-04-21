import { Hono } from "hono";
import { locationSaveSchema } from "@qahal/shared";
import type { Bindings } from "../types/env";
import { requireTelegramIdentity } from "../lib/telegramIdentity";

const hasD1 = (db: unknown): db is { prepare: (query: string) => { bind: (...args: unknown[]) => { run: () => Promise<unknown> } } } => {
  return typeof db === "object" && db !== null && "prepare" in db;
};

export const locationRoute = new Hono<{ Bindings: Bindings }>();

locationRoute.post("/save", async (c) => {
  const payload = await c.req.json().catch(() => null);
  const parsed = locationSaveSchema.safeParse(payload);

  if (!parsed.success) {
    return c.json({ ok: false, error: "invalid_payload" }, 400);
  }

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: true });
  }

  const { telegramId, city, state, country, latitude, longitude } = parsed.data;
  const identity = await requireTelegramIdentity(c, telegramId);
  if (!identity.ok) {
    return c.json({ ok: false, error: identity.error }, identity.status);
  }

  const effectiveTelegramId = identity.telegramId;

  try {
    // Ensure FK target exists when city is selected before onboarding submit creates user row.
    await c.env.DB.prepare(
      `INSERT INTO users (telegram_id)
       VALUES (?1)
       ON CONFLICT(telegram_id) DO NOTHING`
    )
      .bind(effectiveTelegramId)
      .run();

    await c.env.DB.prepare(
      `INSERT INTO user_locations (telegram_id, city, state, country, latitude, longitude)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
    )
      .bind(effectiveTelegramId, city, state, country, latitude, longitude)
      .run();
  } catch (error) {
    try {
      // Backward compatibility for D1 instances that have not run migration 0003 yet.
      await c.env.DB.prepare(
        `INSERT INTO user_locations (telegram_id, latitude, longitude)
         VALUES (?1, ?2, ?3)`
      )
        .bind(effectiveTelegramId, latitude, longitude)
        .run();
    } catch (fallbackError) {
      console.error("location save failed", {
        error,
        fallbackError,
        telegramId: effectiveTelegramId,
      });
      // Keep onboarding flow unblocked even when DB schema is behind.
      return c.json({ ok: true, persisted: false });
    }
  }

  return c.json({ ok: true, persisted: true });
});
