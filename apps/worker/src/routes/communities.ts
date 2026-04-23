import { Hono } from "hono";
import {
  addCommunityMemberByUsernameSchema,
  createCommunitySchema,
  meetingSlotsUpsertSchema,
  nearbyQuerySchema,
  renameCommunitySchema,
} from "@qahal/shared";
import type { Bindings } from "../types/env";
import {
  getNearestSeedLocation,
  getSeedLeadersByCity,
  getSeedLocationByCity,
} from "../services/seedData";
import {
  requireTelegramIdentity,
  resolveOptionalTelegramIdentity,
} from "../lib/telegramIdentity";

export const communitiesRoute = new Hono<{ Bindings: Bindings }>();

type D1Like = {
  prepare: (query: string) => {
    bind: (...args: unknown[]) => {
      all: <T>() => Promise<{ results: T[] }>;
      first: <T>() => Promise<T | null>;
      run: () => Promise<unknown>;
    };
  };
};

const hasD1 = (db: unknown): db is D1Like => {
  return typeof db === "object" && db !== null && "prepare" in db;
};

const distanceKm = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number => {
  const toRadians = (value: number): number => value * (Math.PI / 180);
  const earthRadiusKm = 6371;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

type UserCommunityCapabilities = {
  canCreateQahal: boolean;
  managedCommunityId: number | null;
};

const resolveUserCommunityCapabilities = async (
  db: D1Like,
  telegramId: number,
): Promise<UserCommunityCapabilities> => {
  type CountRow = { count: number };
  type ManagedRow = { communityId: number };

  const [memberRows, managedCommunity] = await Promise.all([
    db
      .prepare(
        `SELECT COUNT(*) as count
         FROM user_community_memberships
         WHERE telegram_id = ?1
           AND status = 'member'`,
      )
      .bind(telegramId)
      .first<CountRow>(),
    db
      .prepare(
        `SELECT id as communityId
         FROM communities
         WHERE owner_telegram_id = ?1
         ORDER BY id ASC
         LIMIT 1`,
      )
      .bind(telegramId)
      .first<ManagedRow>(),
  ]);

  const hasMemberCommunity = Number(memberRows?.count ?? 0) > 0;

  return {
    canCreateQahal: !hasMemberCommunity && !managedCommunity,
    managedCommunityId: managedCommunity?.communityId ?? null,
  };
};

const getNearestCommunitiesFromDb = async (
  db: D1Like,
  latitude: number,
  longitude: number,
  telegramId?: number,
) => {
  type DbCommunityRow = {
    id: number;
    name: string;
    city: string;
    latitude: number;
    longitude: number;
    defaultMemberState: "not_member" | "requested" | "member";
  };

  const candidates = await db
    .prepare(
      `SELECT id,
              name,
              city,
              latitude,
              longitude,
              default_member_state as defaultMemberState
       FROM communities
       ORDER BY ((latitude - ?1) * (latitude - ?1) + (longitude - ?2) * (longitude - ?2)) ASC
       LIMIT 8`,
    )
    .bind(latitude, longitude)
    .all<DbCommunityRow>();

  const rows = candidates.results ?? [];
  if (rows.length === 0) {
    return [];
  }

  let capabilities: UserCommunityCapabilities = {
    canCreateQahal: true,
    managedCommunityId: null,
  };

  if (typeof telegramId === "number") {
    capabilities = await resolveUserCommunityCapabilities(db, telegramId);
  }

  const membershipByCommunityId = new Map<
    number,
    "not_member" | "requested" | "member"
  >();

  if (typeof telegramId === "number") {
    type MembershipRow = {
      communityId: number;
      status: "not_member" | "requested" | "member";
    };

    const memberships = await db
      .prepare(
        `SELECT community_id as communityId, status
         FROM user_community_memberships
         WHERE telegram_id = ?1`,
      )
      .bind(telegramId)
      .all<MembershipRow>();

    for (const membership of memberships.results ?? []) {
      membershipByCommunityId.set(membership.communityId, membership.status);
    }
  }

  const forceNoMembership =
    typeof telegramId === "number" && membershipByCommunityId.size === 0;

  return rows.slice(0, 3).map((community) => ({
    id: community.id,
    name: community.name,
    city: community.city,
    distanceKm: Number(
      distanceKm(
        latitude,
        longitude,
        community.latitude,
        community.longitude,
      ).toFixed(1),
    ),
    memberState: forceNoMembership
      ? "not_member"
      : (membershipByCommunityId.get(community.id) ??
        community.defaultMemberState ??
        "not_member"),
    canManage: capabilities.managedCommunityId === community.id,
    canCreateQahal: capabilities.canCreateQahal,
  }));
};

type DbCityLocation = {
  city: string;
  country: string;
};

const getDbLocation = async (
  db: D1Like,
  city: string | undefined,
  latitude: string | undefined,
  longitude: string | undefined,
): Promise<DbCityLocation | null> => {
  if (city) {
    const byCity = await db
      .prepare(
        `SELECT city, country
         FROM communities
         WHERE lower(city) = lower(?1)
         LIMIT 1`,
      )
      .bind(city)
      .first<DbCityLocation>();

    if (byCity) {
      return byCity;
    }
  }

  if (latitude && longitude) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const nearest = await db
        .prepare(
          `SELECT city, country
           FROM communities
           ORDER BY ((latitude - ?1) * (latitude - ?1) + (longitude - ?2) * (longitude - ?2)) ASC
           LIMIT 1`,
        )
        .bind(lat, lng)
        .first<DbCityLocation>();

      if (nearest) {
        return nearest;
      }
    }
  }

  return null;
};

const getDbPeopleByCity = async (db: D1Like, city: string) => {
  type PersonRow = {
    id: number;
    name: string;
    city: string;
    locationKey: string;
  };
  type BadgeRow = {
    personId: number;
    kind: string;
    label: string;
    years: number | null;
  };

  const people = await db
    .prepare(
      `SELECT id, name, city, location_key as locationKey
       FROM community_people
       WHERE lower(city) = lower(?1)
       ORDER BY name ASC`,
    )
    .bind(city)
    .all<PersonRow>();

  const badges = await db
    .prepare(
      `SELECT cpb.person_id as personId,
              cpb.kind,
              cpb.label,
              cpb.years
       FROM community_person_badges cpb
       JOIN community_people cp ON cp.id = cpb.person_id
       WHERE lower(cp.city) = lower(?1)
       ORDER BY cpb.person_id ASC`,
    )
    .bind(city)
    .all<BadgeRow>();

  const badgesByPersonId = new Map<
    number,
    Array<{ kind: string; label: string; years?: number }>
  >();
  for (const badge of badges.results ?? []) {
    const list = badgesByPersonId.get(badge.personId) ?? [];
    list.push(
      badge.years === null
        ? { kind: badge.kind, label: badge.label }
        : { kind: badge.kind, label: badge.label, years: badge.years },
    );
    badgesByPersonId.set(badge.personId, list);
  }

  return (people.results ?? []).map((person) => ({
    id: person.id,
    name: person.name,
    city: person.city,
    locationKey: person.locationKey,
    badges: badgesByPersonId.get(person.id) ?? [],
  }));
};

const getManagedCommunityIdByOwner = async (
  db: D1Like,
  telegramId: number,
): Promise<number | null> => {
  type ManagedRow = { communityId: number };
  const managed = await db
    .prepare(
      `SELECT id as communityId
       FROM communities
       WHERE owner_telegram_id = ?1
       ORDER BY id ASC
       LIMIT 1`,
    )
    .bind(telegramId)
    .first<ManagedRow>();
  return managed?.communityId ?? null;
};

const assertLeaderOwnership = async (
  db: D1Like,
  communityId: number,
  telegramId: number,
): Promise<boolean> => {
  type OwnershipRow = { owned: number };
  const ownership = await db
    .prepare(
      `SELECT COUNT(*) as owned
       FROM communities
       WHERE id = ?1 AND owner_telegram_id = ?2`,
    )
    .bind(communityId, telegramId)
    .first<OwnershipRow>();

  return Number(ownership?.owned ?? 0) > 0;
};

const normalizeUsername = (value: string): string => {
  const trimmed = value.trim();
  return trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
};

communitiesRoute.post("/", async (c) => {
  const payload = await c.req.json().catch(() => null);
  const parsed = createCommunitySchema.safeParse(payload);

  if (!parsed.success) {
    return c.json({ ok: false, error: "invalid_payload" }, 400);
  }

  const identity = await requireTelegramIdentity(c, parsed.data.telegramId);
  if (!identity.ok) {
    return c.json({ ok: false, error: identity.error }, identity.status);
  }

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: false, error: "database_unavailable" }, 503);
  }

  const effectiveTelegramId = identity.telegramId;
  const capabilities = await resolveUserCommunityCapabilities(
    c.env.DB,
    effectiveTelegramId,
  );

  if (!capabilities.canCreateQahal) {
    return c.json({ ok: false, error: "cannot_create_qahal" }, 409);
  }

  const { name, city, country, latitude, longitude } = parsed.data;

  await c.env.DB.prepare(
    `INSERT INTO communities (
      name,
      city,
      country,
      latitude,
      longitude,
      default_member_state,
      owner_telegram_id
    ) VALUES (?1, ?2, ?3, ?4, ?5, 'not_member', ?6)`,
  )
    .bind(name.trim(), city.trim(), country.trim(), latitude, longitude, effectiveTelegramId)
    .run();

  type CreatedCommunityRow = { id: number; name: string; city: string };
  const createdCommunity = await c.env.DB
    .prepare(
      `SELECT id, name, city
       FROM communities
       WHERE id = last_insert_rowid()`,
    )
    .bind()
    .first<CreatedCommunityRow>();

  if (!createdCommunity) {
    return c.json({ ok: false, error: "create_failed" }, 500);
  }

  await c.env.DB.prepare(
    `INSERT INTO user_community_memberships (telegram_id, community_id, status)
     VALUES (?1, ?2, 'member')
     ON CONFLICT(telegram_id, community_id) DO UPDATE SET
       status='member',
       updated_at=CURRENT_TIMESTAMP`,
  )
    .bind(effectiveTelegramId, createdCommunity.id)
    .run();

  return c.json({
    ok: true,
    community: {
      id: createdCommunity.id,
      name: createdCommunity.name,
      city: createdCommunity.city,
      canManage: true,
      canCreateQahal: false,
    },
  });
});

communitiesRoute.get("/manage", async (c) => {
  const telegramIdRaw = c.req.query("telegramId");
  const requestedTelegramId = Number(telegramIdRaw);
  if (!Number.isFinite(requestedTelegramId)) {
    return c.json({ ok: false, error: "invalid_telegram_id" }, 400);
  }

  const identity = await requireTelegramIdentity(c, requestedTelegramId);
  if (!identity.ok) {
    return c.json({ ok: false, error: identity.error }, identity.status);
  }

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: false, error: "database_unavailable" }, 503);
  }

  const effectiveTelegramId = identity.telegramId;
  const managedCommunityId = await getManagedCommunityIdByOwner(
    c.env.DB,
    effectiveTelegramId,
  );

  if (!managedCommunityId) {
    return c.json({ ok: false, error: "not_qahal_leader" }, 403);
  }

  type CommunityRow = { id: number; name: string; city: string };
  type SlotRow = { id: number; weekday: number; timeMinutes: number };
  type MemberRow = {
    telegramId: number;
    firstName: string | null;
    username: string | null;
  };

  const [community, slots, members] = await Promise.all([
    c.env.DB
      .prepare(
        `SELECT id, name, city
         FROM communities
         WHERE id = ?1
         LIMIT 1`,
      )
      .bind(managedCommunityId)
      .first<CommunityRow>(),
    c.env.DB
      .prepare(
        `SELECT id,
                weekday,
                time_minutes as timeMinutes
         FROM community_meeting_slots
         WHERE community_id = ?1
         ORDER BY weekday ASC, time_minutes ASC`,
      )
      .bind(managedCommunityId)
      .all<SlotRow>(),
    c.env.DB
      .prepare(
        `SELECT u.telegram_id as telegramId,
                u.first_name as firstName,
                u.username as username
         FROM user_community_memberships m
         JOIN users u ON u.telegram_id = m.telegram_id
         WHERE m.community_id = ?1
           AND m.status = 'member'
         ORDER BY lower(COALESCE(u.first_name, u.username, '')) ASC`,
      )
      .bind(managedCommunityId)
      .all<MemberRow>(),
  ]);

  if (!community) {
    return c.json({ ok: false, error: "community_not_found" }, 404);
  }

  return c.json({
    ok: true,
    community: {
      communityId: community.id,
      communityName: community.name,
      city: community.city,
      canManage: true,
      canCreateQahal: false,
      meetingSlots: slots.results ?? [],
      members: members.results ?? [],
    },
  });
});

communitiesRoute.patch("/:communityId", async (c) => {
  const communityId = Number(c.req.param("communityId"));
  if (!Number.isFinite(communityId)) {
    return c.json({ ok: false, error: "invalid_community_id" }, 400);
  }

  const payload = await c.req.json().catch(() => null);
  const parsed = renameCommunitySchema.safeParse(payload);
  if (!parsed.success) {
    return c.json({ ok: false, error: "invalid_payload" }, 400);
  }

  const identity = await requireTelegramIdentity(c, parsed.data.telegramId);
  if (!identity.ok) {
    return c.json({ ok: false, error: identity.error }, identity.status);
  }

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: false, error: "database_unavailable" }, 503);
  }

  const ownsCommunity = await assertLeaderOwnership(
    c.env.DB,
    communityId,
    identity.telegramId,
  );
  if (!ownsCommunity) {
    return c.json({ ok: false, error: "forbidden" }, 403);
  }

  await c.env.DB.prepare(
    `UPDATE communities
     SET name = ?1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?2`,
  )
    .bind(parsed.data.name.trim(), communityId)
    .run();

  return c.json({ ok: true });
});

communitiesRoute.put("/:communityId/meeting-slots", async (c) => {
  const communityId = Number(c.req.param("communityId"));
  if (!Number.isFinite(communityId)) {
    return c.json({ ok: false, error: "invalid_community_id" }, 400);
  }

  const payload = await c.req.json().catch(() => null);
  const parsed = meetingSlotsUpsertSchema.safeParse(payload);
  if (!parsed.success) {
    return c.json({ ok: false, error: "invalid_payload" }, 400);
  }

  const identity = await requireTelegramIdentity(c, parsed.data.telegramId);
  if (!identity.ok) {
    return c.json({ ok: false, error: identity.error }, identity.status);
  }

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: false, error: "database_unavailable" }, 503);
  }

  const ownsCommunity = await assertLeaderOwnership(
    c.env.DB,
    communityId,
    identity.telegramId,
  );
  if (!ownsCommunity) {
    return c.json({ ok: false, error: "forbidden" }, 403);
  }

  await c.env.DB
    .prepare(
      `DELETE FROM community_meeting_slots
       WHERE community_id = ?1`,
    )
    .bind(communityId)
    .run();

  const dedupe = new Set<string>();
  for (const slot of parsed.data.slots) {
    const key = `${slot.weekday}:${slot.timeMinutes}`;
    if (dedupe.has(key)) {
      continue;
    }
    dedupe.add(key);

    await c.env.DB
      .prepare(
        `INSERT INTO community_meeting_slots (community_id, weekday, time_minutes)
         VALUES (?1, ?2, ?3)`,
      )
      .bind(communityId, slot.weekday, slot.timeMinutes)
      .run();
  }

  return c.json({ ok: true });
});

communitiesRoute.post("/:communityId/members/by-username", async (c) => {
  const communityId = Number(c.req.param("communityId"));
  if (!Number.isFinite(communityId)) {
    return c.json({ ok: false, error: "invalid_community_id" }, 400);
  }

  const payload = await c.req.json().catch(() => null);
  const parsed = addCommunityMemberByUsernameSchema.safeParse(payload);
  if (!parsed.success) {
    return c.json({ ok: false, error: "invalid_payload" }, 400);
  }

  const identity = await requireTelegramIdentity(c, parsed.data.telegramId);
  if (!identity.ok) {
    return c.json({ ok: false, error: identity.error }, identity.status);
  }

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: false, error: "database_unavailable" }, 503);
  }

  const ownsCommunity = await assertLeaderOwnership(
    c.env.DB,
    communityId,
    identity.telegramId,
  );
  if (!ownsCommunity) {
    return c.json({ ok: false, error: "forbidden" }, 403);
  }

  const normalizedUsername = normalizeUsername(parsed.data.username);

  type UserRow = { telegramId: number; username: string | null; firstName: string | null };
  const targetUser = await c.env.DB
    .prepare(
      `SELECT telegram_id as telegramId,
              username,
              first_name as firstName
       FROM users
       WHERE lower(username) = lower(?1)
       LIMIT 1`,
    )
    .bind(normalizedUsername)
    .first<UserRow>();

  if (!targetUser) {
    return c.json({ ok: false, error: "user_not_found" }, 404);
  }

  type ExistingMemberRow = { count: number };
  const memberElsewhere = await c.env.DB
    .prepare(
      `SELECT COUNT(*) as count
       FROM user_community_memberships
       WHERE telegram_id = ?1
         AND status = 'member'
         AND community_id != ?2`,
    )
    .bind(targetUser.telegramId, communityId)
    .first<ExistingMemberRow>();

  if (Number(memberElsewhere?.count ?? 0) > 0) {
    return c.json({ ok: false, error: "already_member_elsewhere" }, 409);
  }

  await c.env.DB
    .prepare(
      `INSERT INTO user_community_memberships (telegram_id, community_id, status)
       VALUES (?1, ?2, 'member')
       ON CONFLICT(telegram_id, community_id) DO UPDATE SET
         status='member',
         updated_at=CURRENT_TIMESTAMP`,
    )
    .bind(targetUser.telegramId, communityId)
    .run();

  return c.json({
    ok: true,
    member: {
      telegramId: targetUser.telegramId,
      firstName: targetUser.firstName,
      username: targetUser.username,
    },
  });
});

communitiesRoute.get("/nearby", async (c) => {
  const query = c.req.query();
  const parsed = nearbyQuerySchema.safeParse(query);

  if (!parsed.success) {
    return c.json({ ok: false, error: "invalid_query" }, 400);
  }

  const identity = await resolveOptionalTelegramIdentity(
    c,
    parsed.data.telegramId,
  );
  if (!identity.ok) {
    return c.json({ ok: false, error: identity.error }, identity.status);
  }

  const effectiveTelegramId = identity.telegramId;

  if (hasD1(c.env.DB)) {
    try {
      const communities = await getNearestCommunitiesFromDb(
        c.env.DB,
        parsed.data.latitude,
        parsed.data.longitude,
        effectiveTelegramId,
      );

      if (communities.length > 0) {
        return c.json({ ok: true, communities });
      }
    } catch (error) {
      console.warn(
        "communities nearby db lookup failed, falling back to seed",
        {
          error,
        },
      );
    }
  }

  const nearest = getNearestSeedLocation(
    parsed.data.latitude,
    parsed.data.longitude,
  );
  const communities =
    typeof effectiveTelegramId === "number"
      ? nearest.communities.map((community) => ({
          ...community,
          memberState: "not_member" as const,
          canManage: false,
          canCreateQahal: true,
        }))
      : nearest.communities;

  return c.json({
    ok: true,
    communities,
  });
});

communitiesRoute.get("/people", async (c) => {
  const city = c.req.query("city");
  const latitude = c.req.query("latitude");
  const longitude = c.req.query("longitude");

  if (hasD1(c.env.DB)) {
    try {
      const location = await getDbLocation(c.env.DB, city, latitude, longitude);
      if (location) {
        const people = await getDbPeopleByCity(c.env.DB, location.city);
        return c.json({
          ok: true,
          location,
          people,
        });
      }
    } catch (error) {
      console.warn(
        "communities people db lookup failed, falling back to seed",
        {
          error,
        },
      );
    }
  }

  const byCity = city ? getSeedLocationByCity(city) : undefined;

  if (byCity) {
    return c.json({
      ok: true,
      location: { city: byCity.city, country: byCity.country },
      people: byCity.people,
    });
  }

  if (latitude && longitude) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const nearest = getNearestSeedLocation(lat, lng);
      return c.json({
        ok: true,
        location: { city: nearest.city, country: nearest.country },
        people: nearest.people,
      });
    }
  }

  return c.json({ ok: false, error: "city_or_coordinates_required" }, 400);
});

communitiesRoute.get("/leaders", async (c) => {
  const city = c.req.query("city");
  if (!city) {
    return c.json({ ok: false, error: "city_required" }, 400);
  }

  if (hasD1(c.env.DB)) {
    try {
      type DbLeaderRow = {
        communityId: number;
        communityName: string;
        personId: number;
        leaderName: string;
      };

      const leaders = await c.env.DB.prepare(
        `SELECT c.id as communityId,
                  c.name as communityName,
                  cp.id as personId,
                  cp.name as leaderName
           FROM community_people cp
           JOIN communities c ON c.id = cp.community_id
           JOIN community_person_badges cpb ON cpb.person_id = cp.id
           WHERE lower(cp.city) = lower(?1)
             AND cpb.kind = 'messenger'
           ORDER BY c.name ASC`,
      )
        .bind(city)
        .all<DbLeaderRow>();

      if ((leaders.results ?? []).length > 0) {
        return c.json({
          ok: true,
          city,
          leaders: leaders.results,
        });
      }
    } catch (error) {
      console.warn(
        "communities leaders db lookup failed, falling back to seed",
        {
          error,
        },
      );
    }
  }

  return c.json({
    ok: true,
    city,
    leaders: getSeedLeadersByCity(city),
  });
});
