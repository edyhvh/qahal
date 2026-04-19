import { Hono } from "hono";
import { onboardingSubmitSchema } from "@qahal/shared";
import type { Bindings } from "../types/env";

type D1Like = {
  prepare: (query: string) => {
    bind: (...args: unknown[]) => {
      run: () => Promise<unknown>;
      first: <T>() => Promise<T | null>;
    };
  };
};

const hasD1 = (db: unknown): db is D1Like => {
  return typeof db === "object" && db !== null && "prepare" in db;
};

const selectUser = async (db: D1Like, telegramId: number): Promise<Record<string, unknown> | null> => {
  try {
    return await db.prepare(
      `SELECT telegram_id as telegramId,
              username,
              first_name as firstName,
              last_name as lastName,
              photo_url as photoUrl,
              language_code as languageCode,
              city,
              onboarding_completed as onboardingCompleted
       FROM users
       WHERE telegram_id = ?1`
    )
      .bind(telegramId)
      .first<Record<string, unknown>>();
  } catch {
    // Backward compatibility for D1 instances without city/onboarding_completed columns.
    const legacyUser = await db.prepare(
      `SELECT telegram_id as telegramId,
              username,
              first_name as firstName,
              last_name as lastName,
              photo_url as photoUrl,
              language_code as languageCode
       FROM users
       WHERE telegram_id = ?1`
    )
      .bind(telegramId)
      .first<Record<string, unknown>>();

    if (!legacyUser) {
      return null;
    }

    return {
      ...legacyUser,
      city: null,
      onboardingCompleted: false
    };
  }
};

export const usersRoute = new Hono<{ Bindings: Bindings }>();

usersRoute.post("/onboarding", async (c) => {
  const payload = await c.req.json().catch(() => null);
  const parsed = onboardingSubmitSchema.safeParse(payload);

  if (!parsed.success) {
    return c.json({ ok: false, error: "invalid_payload" }, 400);
  }

  const { telegramId, firstName, city, languageCode } = parsed.data;

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: true, user: { telegramId, firstName, city, languageCode, onboardingCompleted: true } });
  }

  try {
    await c.env.DB.prepare(
      `INSERT INTO users (telegram_id, first_name, city, language_code, onboarding_completed)
       VALUES (?1, ?2, ?3, ?4, 1)
       ON CONFLICT(telegram_id) DO UPDATE SET
         first_name=excluded.first_name,
         city=excluded.city,
         language_code=excluded.language_code,
         onboarding_completed=1,
         updated_at=CURRENT_TIMESTAMP`
    )
      .bind(telegramId, firstName, city, languageCode)
      .run();
  } catch {
    try {
      // Backward compatibility for D1 instances without city/onboarding_completed columns.
      await c.env.DB.prepare(
        `INSERT INTO users (telegram_id, first_name, language_code)
         VALUES (?1, ?2, ?3)
         ON CONFLICT(telegram_id) DO UPDATE SET
           first_name=excluded.first_name,
           language_code=excluded.language_code,
           updated_at=CURRENT_TIMESTAMP`
      )
        .bind(telegramId, firstName, languageCode)
        .run();
    } catch (error) {
      console.error("onboarding save failed", { error, telegramId });
      return c.json({
        ok: true,
        user: { telegramId, firstName, city, languageCode, onboardingCompleted: true },
        persisted: false
      });
    }
  }

  const user = await selectUser(c.env.DB, telegramId);

  return c.json({ ok: true, user });
});

usersRoute.get("/:telegramId", async (c) => {
  const telegramId = Number(c.req.param("telegramId"));
  if (!Number.isFinite(telegramId)) {
    return c.json({ ok: false, error: "invalid_telegram_id" }, 400);
  }

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: true, user: null });
  }

  const user = await selectUser(c.env.DB, telegramId);

  return c.json({ ok: true, user });
});