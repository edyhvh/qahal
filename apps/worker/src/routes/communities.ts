import { Hono } from "hono";
import { nearbyQuerySchema } from "@qahal/shared";
import type { Bindings } from "../types/env";
import { getNearestSeedLocation, getSeedLeadersByCity, getSeedLocationByCity } from "../services/seedData";

export const communitiesRoute = new Hono<{ Bindings: Bindings }>();

communitiesRoute.get("/nearby", (c) => {
  const query = c.req.query();
  const parsed = nearbyQuerySchema.safeParse(query);

  if (!parsed.success) {
    return c.json({ ok: false, error: "invalid_query" }, 400);
  }

  const nearest = getNearestSeedLocation(parsed.data.latitude, parsed.data.longitude);

  return c.json({
    ok: true,
    communities: nearest.communities
  });
});

communitiesRoute.get("/people", (c) => {
  const city = c.req.query("city");
  const latitude = c.req.query("latitude");
  const longitude = c.req.query("longitude");

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

communitiesRoute.get("/leaders", (c) => {
  const city = c.req.query("city");
  if (!city) {
    return c.json({ ok: false, error: "city_required" }, 400);
  }

  return c.json({
    ok: true,
    city,
    leaders: getSeedLeadersByCity(city)
  });
});