import { Hono } from "hono";
import { nearbyQuerySchema } from "@qahal/shared";
import type { Bindings } from "../types/env";
import { getNearestSeedLocation, getSeedLeadersByCity, getSeedLocationByCity } from "../services/seedData";

export const communitiesRoute = new Hono<{ Bindings: Bindings }>();

type D1Like = {
  prepare: (query: string) => {
    bind: (...args: unknown[]) => {
      all: <T>() => Promise<{ results: T[] }>;
      first: <T>() => Promise<T | null>;
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

  const membershipByCommunityId = new Map<number, "not_member" | "requested" | "member">();

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
      distanceKm(latitude, longitude, community.latitude, community.longitude).toFixed(1),
    ),
    memberState:
      forceNoMembership
        ? "not_member"
        : (membershipByCommunityId.get(community.id) ??
          community.defaultMemberState ??
          "not_member"),
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

communitiesRoute.get("/nearby", async (c) => {
  const query = c.req.query();
  const parsed = nearbyQuerySchema.safeParse(query);

  if (!parsed.success) {
    return c.json({ ok: false, error: "invalid_query" }, 400);
  }

  if (hasD1(c.env.DB)) {
    try {
      const communities = await getNearestCommunitiesFromDb(
        c.env.DB,
        parsed.data.latitude,
        parsed.data.longitude,
        parsed.data.telegramId,
      );

      if (communities.length > 0) {
        return c.json({ ok: true, communities });
      }
    } catch (error) {
      console.warn("communities nearby db lookup failed, falling back to seed", {
        error,
      });
    }
  }

  const nearest = getNearestSeedLocation(parsed.data.latitude, parsed.data.longitude);

  return c.json({
    ok: true,
    communities: nearest.communities
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
      console.warn("communities people db lookup failed, falling back to seed", {
        error,
      });
    }
  }

  const byCity = city ? getSeedLocationByCity(city) : undefined;

  if (byCity) {
    return c.json({
      ok: true,
      location: { city: byCity.city, country: byCity.country },
      people: byCity.people
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
        people: nearest.people
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

      const leaders = await c.env.DB
        .prepare(
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
      console.warn("communities leaders db lookup failed, falling back to seed", {
        error,
      });
    }
  }

  return c.json({
    ok: true,
    city,
    leaders: getSeedLeadersByCity(city)
  });
});