import { Hono } from "hono";
import { locationUpsertSchema } from "@qahal/shared";
import type { Bindings } from "../types/env";

const hasD1 = (db: unknown): db is { prepare: (query: string) => { bind: (...args: unknown[]) => { run: () => Promise<unknown> } } } => {
  return typeof db === "object" && db !== null && "prepare" in db;
};

export const locationsRoute = new Hono<{ Bindings: Bindings }>();

locationsRoute.post("/", async (c) => {
  const payload = await c.req.json().catch(() => null);
  const parsed = locationUpsertSchema.safeParse(payload);

  if (!parsed.success) {
    return c.json({ ok: false, error: "invalid_payload" }, 400);
  }

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: true });
  }

  const { telegramId, latitude, longitude, accuracy } = parsed.data;

  await c.env.DB.prepare(
    `INSERT INTO user_locations (telegram_id, latitude, longitude, accuracy)
     VALUES (?1, ?2, ?3, ?4)`
  )
    .bind(telegramId, latitude, longitude, accuracy ?? null)
    .run();

  return c.json({ ok: true });
});