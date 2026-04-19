import { Hono } from "hono";
import { onboardingSubmitSchema } from "@qahal/shared";
import type { Bindings } from "../types/env";

type D1Like = {
  prepare: (query: string) => {
    bind: (...args: unknown[]) => {
      run: () => Promise<unknown>;
      all: <T>() => Promise<{ results: T[] }>;
      first: <T>() => Promise<T | null>;
    };
  };
};

const hasD1 = (db: unknown): db is D1Like => {
  return typeof db === "object" && db !== null && "prepare" in db;
};

const EMUNAH_BADGE = { key: "emunah", label: "Emunah" };

const shouldGrantEmunahBadge = (
  answers: Record<string, string> | undefined,
): boolean => {
  if (!answers) {
    return false;
  }

  const doctrinalSteps = ["1", "2", "3", "4", "5", "6", "7"];
  return doctrinalSteps.every((stepKey) => {
    return String(answers[stepKey] ?? "").toLowerCase() === "yes";
  });
};

const selectUserBase = async (
  db: D1Like,
  telegramId: number,
): Promise<Record<string, unknown> | null> => {
  try {
    return await db.prepare(
      `SELECT telegram_id as telegramId,
              username,
              first_name as firstName,
              last_name as lastName,
              photo_url as photoUrl,
              language_code as languageCode,
              city,
              birth_date as birthDate,
              created_at as createdAt,
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
      birthDate: null,
      onboardingCompleted: false
    };
  }
};

const selectUserBadges = async (db: D1Like, telegramId: number): Promise<string[]> => {
  try {
    type BadgeRow = { badgeLabel: string };
    const result = await db.prepare(
      `SELECT badge_label as badgeLabel
       FROM user_badges
       WHERE telegram_id = ?1
       ORDER BY badge_label ASC`
    )
      .bind(telegramId)
      .all<BadgeRow>();

    return (result.results ?? []).map((row) => row.badgeLabel);
  } catch {
    return [];
  }
};

const selectUserQahalName = async (
  db: D1Like,
  telegramId: number,
): Promise<string | null> => {
  try {
    type QahalRow = { qahalName: string };
    const memberCommunity = await db
      .prepare(
        `SELECT c.name as qahalName
         FROM user_community_memberships m
         JOIN communities c ON c.id = m.community_id
         WHERE m.telegram_id = ?1 AND m.status = 'member'
         ORDER BY m.updated_at DESC
         LIMIT 1`
      )
      .bind(telegramId)
      .first<QahalRow>();

    return memberCommunity?.qahalName ?? null;
  } catch {
    return null;
  }
};

const selectLatestLocation = async (
  db: D1Like,
  telegramId: number,
): Promise<{ latestLatitude?: number; latestLongitude?: number }> => {
  try {
    type LocationRow = {
      latestLatitude: number;
      latestLongitude: number;
    };

    const latest = await db
      .prepare(
        `SELECT latitude as latestLatitude,
                longitude as latestLongitude
         FROM user_locations
         WHERE telegram_id = ?1
         ORDER BY id DESC
         LIMIT 1`
      )
      .bind(telegramId)
      .first<LocationRow>();

    if (!latest) {
      return {};
    }

    return {
      latestLatitude: latest.latestLatitude,
      latestLongitude: latest.latestLongitude,
    };
  } catch {
    return {};
  }
};

const selectUser = async (
  db: D1Like,
  telegramId: number,
): Promise<Record<string, unknown> | null> => {
  const base = await selectUserBase(db, telegramId);
  if (!base) {
    return null;
  }

  const [baseBadges, qahalName, latestLocation] = await Promise.all([
    selectUserBadges(db, telegramId),
    selectUserQahalName(db, telegramId),
    selectLatestLocation(db, telegramId),
  ]);

  const badgesSet = new Set<string>(baseBadges);

  if (qahalName) {
    badgesSet.add("Kehilah");
  }

  const createdAtValue = base.createdAt;
  if (typeof createdAtValue === "string" && createdAtValue.length > 0) {
    const createdAt = new Date(createdAtValue);
    if (!Number.isNaN(createdAt.getTime())) {
      const now = new Date();
      let years = now.getFullYear() - createdAt.getFullYear();
      const anniversaryPending =
        now.getMonth() < createdAt.getMonth() ||
        (now.getMonth() === createdAt.getMonth() &&
          now.getDate() < createdAt.getDate());
      if (anniversaryPending) {
        years -= 1;
      }
      badgesSet.add(`Years in Emunah (${Math.max(0, years)})`);
    }
  }

  return {
    ...base,
    badges: Array.from(badgesSet),
    qahalName,
    ...latestLocation,
  };
};

const upsertOnboardingAnswers = async (
  db: D1Like,
  telegramId: number,
  answers: Record<string, string> | undefined,
) => {
  if (!answers || Object.keys(answers).length === 0) {
    return;
  }

  for (const [questionKey, answerValue] of Object.entries(answers)) {
    await db
      .prepare(
        `INSERT INTO user_onboarding_answers (telegram_id, question_key, answer_value)
         VALUES (?1, ?2, ?3)
         ON CONFLICT(telegram_id, question_key) DO UPDATE SET
           answer_value=excluded.answer_value,
           updated_at=CURRENT_TIMESTAMP`
      )
      .bind(telegramId, questionKey, answerValue)
      .run();
  }
};

const syncEmunahBadge = async (
  db: D1Like,
  telegramId: number,
  grant: boolean,
) => {
  if (grant) {
    await db
      .prepare(
        `INSERT INTO user_badges (telegram_id, badge_key, badge_label)
         VALUES (?1, ?2, ?3)
         ON CONFLICT(telegram_id, badge_key) DO UPDATE SET
           badge_label=excluded.badge_label,
           updated_at=CURRENT_TIMESTAMP`
      )
      .bind(telegramId, EMUNAH_BADGE.key, EMUNAH_BADGE.label)
      .run();
    return;
  }

  await db
    .prepare(
      `DELETE FROM user_badges
       WHERE telegram_id = ?1 AND badge_key = ?2`
    )
    .bind(telegramId, EMUNAH_BADGE.key)
    .run();
};

export const usersRoute = new Hono<{ Bindings: Bindings }>();

usersRoute.post("/onboarding", async (c) => {
  const payload = await c.req.json().catch(() => null);
  const parsed = onboardingSubmitSchema.safeParse(payload);

  if (!parsed.success) {
    return c.json({ ok: false, error: "invalid_payload" }, 400);
  }

  const { telegramId, firstName, city, languageCode, answers } = parsed.data;

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

    await upsertOnboardingAnswers(c.env.DB, telegramId, answers);
    await syncEmunahBadge(
      c.env.DB,
      telegramId,
      shouldGrantEmunahBadge(answers),
    );
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

      await upsertOnboardingAnswers(c.env.DB, telegramId, answers);
      await syncEmunahBadge(
        c.env.DB,
        telegramId,
        shouldGrantEmunahBadge(answers),
      );
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

usersRoute.put("/:telegramId/profile", async (c) => {
  const telegramId = Number(c.req.param("telegramId"));
  if (!Number.isFinite(telegramId)) {
    return c.json({ ok: false, error: "invalid_telegram_id" }, 400);
  }

  const payload = (await c.req.json().catch(() => ({}))) as {
    firstName?: string;
    birthDate?: string | null;
  };

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: true, user: null });
  }

  const safeFirstName =
    typeof payload.firstName === "string" && payload.firstName.trim().length > 0
      ? payload.firstName.trim().slice(0, 80)
      : null;
  const safeBirthDate =
    typeof payload.birthDate === "string" && payload.birthDate.trim().length > 0
      ? payload.birthDate.trim()
      : null;

  try {
    await c.env.DB
      .prepare(
        `INSERT INTO users (telegram_id, first_name, birth_date)
         VALUES (?1, ?2, ?3)
         ON CONFLICT(telegram_id) DO UPDATE SET
           first_name=COALESCE(?2, users.first_name),
           birth_date=COALESCE(?3, users.birth_date),
           updated_at=CURRENT_TIMESTAMP`
      )
      .bind(telegramId, safeFirstName, safeBirthDate)
      .run();
  } catch {
    await c.env.DB
      .prepare(
        `INSERT INTO users (telegram_id, first_name)
         VALUES (?1, ?2)
         ON CONFLICT(telegram_id) DO UPDATE SET
           first_name=COALESCE(?2, users.first_name),
           updated_at=CURRENT_TIMESTAMP`
      )
      .bind(telegramId, safeFirstName)
      .run();
  }

  const user = await selectUser(c.env.DB, telegramId);
  return c.json({ ok: true, user });
});

usersRoute.delete("/:telegramId/local-reset", async (c) => {
  const telegramId = Number(c.req.param("telegramId"));
  if (!Number.isFinite(telegramId)) {
    return c.json({ ok: false, error: "invalid_telegram_id" }, 400);
  }

  const requestHost = new URL(c.req.url).hostname.toLowerCase();
  const isLocalHost =
    requestHost === "localhost" ||
    requestHost === "127.0.0.1" ||
    requestHost === "::1";

  if (!isLocalHost) {
    return c.json({ ok: false, error: "local_only" }, 403);
  }

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: true, reset: false });
  }

  const deleteStatements = [
    "DELETE FROM user_badges WHERE telegram_id = ?1",
    "DELETE FROM user_onboarding_answers WHERE telegram_id = ?1",
    "DELETE FROM user_community_memberships WHERE telegram_id = ?1",
    "DELETE FROM user_locations WHERE telegram_id = ?1",
    "DELETE FROM users WHERE telegram_id = ?1",
  ];

  for (const query of deleteStatements) {
    try {
      await c.env.DB.prepare(query).bind(telegramId).run();
    } catch {
      // Ignore missing tables to keep local reset resilient across migrations.
    }
  }

  return c.json({ ok: true, reset: true });
});