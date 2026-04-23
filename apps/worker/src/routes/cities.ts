import { Hono } from "hono";
import { citySearchQuerySchema, type CitySuggestion } from "@qahal/shared";
import type { Bindings } from "../types/env";

interface PhotonFeature {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    name?: string;
    city?: string;
    state?: string;
    county?: string;
    region?: string;
    country?: string;
    osm_value?: string;
  };
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

type EnrichedSuggestion = CitySuggestion & { placePriority: number };

const normalizeText = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const toRadians = (value: number): number => value * (Math.PI / 180);

const distanceKm = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number => {
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

const cityKey = (suggestion: CitySuggestion): string => {
  return `${suggestion.city}|${suggestion.state}|${suggestion.country}`
    .trim()
    .toLowerCase();
};

const dedupeSuggestions = <T extends CitySuggestion>(items: T[]): T[] => {
  const unique = new Map<string, T>();
  for (const item of items) {
    const key = cityKey(item);
    if (!unique.has(key)) {
      unique.set(key, item);
    }
  }
  return Array.from(unique.values());
};

const placePriority = (osmValue?: string): number => {
  switch ((osmValue ?? "").toLowerCase()) {
    case "city":
      return 1;
    case "town":
      return 0.95;
    case "municipality":
      return 0.9;
    case "village":
      return 0.85;
    case "hamlet":
      return 0.8;
    default:
      return 0.5;
  }
};

const similarityScore = (query: string, suggestion: CitySuggestion): number => {
  const q = normalizeText(query);
  const city = normalizeText(suggestion.city);

  if (city === q) {
    return 1;
  }

  if (city.startsWith(q)) {
    return 0.95;
  }

  if (city.includes(q)) {
    return 0.9;
  }

  return 0.2;
};

const normalizeSuggestion = (
  feature: PhotonFeature,
): EnrichedSuggestion | null => {
  const coordinates = feature.geometry?.coordinates;
  if (!coordinates || coordinates.length < 2) {
    return null;
  }

  const [longitude, latitude] = coordinates;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const city = feature.properties?.city ?? feature.properties?.name;
  const state =
    feature.properties?.state ??
    feature.properties?.county ??
    feature.properties?.region ??
    feature.properties?.country;
  const country = feature.properties?.country;

  if (!city || !state || !country) {
    return null;
  }

  return {
    city,
    state,
    country,
    latitude,
    longitude,
    label: `${city}, ${state}, ${country}`,
    placePriority: placePriority(feature.properties?.osm_value),
  };
};

export const citiesRoute = new Hono<{ Bindings: Bindings }>();

citiesRoute.get("/search", async (c) => {
  const parsed = citySearchQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ ok: false, error: "invalid_query" }, 400);
  }

  const params = new URLSearchParams({
    q: parsed.data.q,
    limit: "50",
  });

  const response = await fetch(
    `https://photon.komoot.io/api/?${params.toString()}`,
  );
  if (!response.ok) {
    return c.json({ ok: false, error: "city_provider_unavailable" }, 502);
  }

  const body = (await response.json()) as PhotonResponse;
  let suggestions = (body.features ?? [])
    .map(normalizeSuggestion)
    .filter((entry): entry is EnrichedSuggestion => entry !== null);

  if (
    typeof parsed.data.userLat === "number" &&
    typeof parsed.data.userLng === "number"
  ) {
    const userLat = parsed.data.userLat;
    const userLng = parsed.data.userLng;

    suggestions = suggestions
      .map((suggestion) => ({
        suggestion,
        similarity: similarityScore(parsed.data.q, suggestion),
        place: suggestion.placePriority,
        distance: distanceKm(
          userLat,
          userLng,
          suggestion.latitude,
          suggestion.longitude,
        ),
      }))
      .sort((a, b) => {
        if (b.similarity !== a.similarity) {
          return b.similarity - a.similarity;
        }
        if (b.place !== a.place) {
          return b.place - a.place;
        }
        return a.distance - b.distance;
      })
      .map((entry) => entry.suggestion);
  } else {
    suggestions = suggestions
      .map((suggestion) => ({
        suggestion,
        similarity: similarityScore(parsed.data.q, suggestion),
        place: suggestion.placePriority,
      }))
      .sort((a, b) => {
        if (b.similarity !== a.similarity) {
          return b.similarity - a.similarity;
        }
        return b.place - a.place;
      })
      .map((entry) => entry.suggestion);
  }

  const result = dedupeSuggestions(suggestions)
    .map(({ placePriority: _, ...suggestion }) => suggestion)
    .slice(0, 7);

  return c.json({ ok: true, suggestions: result });
});
