import type { CitySearchResponse, LocationSave, NearbyResponse, OnboardingSubmit } from "@qahal/shared";
import { env } from "./env";

export interface CommunityPerson {
  id: number;
  name: string;
  city: string;
  locationKey: string;
  badges: Array<{ kind: string; label: string; years?: number }>;
}

const baseUrl = env.apiBaseUrl.endsWith("/") ? env.apiBaseUrl.slice(0, -1) : env.apiBaseUrl;

const buildUrl = (path: string): string => {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  if (path.startsWith("/api/") && baseUrl.endsWith("/api")) {
    return `${baseUrl}${path.slice(4)}`;
  }

  return `${baseUrl}${path}`;
};

const getJson = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(buildUrl(path), { signal });
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

const postJson = async <T>(path: string, payload: unknown): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`POST ${path} failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

const putJson = async <T>(path: string, payload: unknown): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`PUT ${path} failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

const deleteJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error(`DELETE ${path} failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export interface UserApiProfile {
  telegramId: number;
  firstName?: string;
  city?: string;
  languageCode?: string;
  onboardingCompleted?: boolean;
  birthDate?: string;
  badges?: string[];
  qahalName?: string;
  latestLatitude?: number;
  latestLongitude?: number;
}

export const api = {
  submitOnboarding: (payload: OnboardingSubmit) => {
    return postJson<{ ok: boolean; user?: UserApiProfile }>("/users/onboarding", payload);
  },

  getUser: (telegramId: number) => {
    return getJson<{ ok: boolean; user: UserApiProfile | null }>(`/users/${telegramId}`);
  },

  updateUserProfile: (telegramId: number, payload: { firstName?: string; birthDate?: string | null }) => {
    return putJson<{ ok: boolean; user: UserApiProfile | null }>(`/users/${telegramId}/profile`, payload);
  },

  resetLocalUser: (telegramId: number) => {
    return deleteJson<{ ok: boolean; reset: boolean }>(`/users/${telegramId}/local-reset`);
  },

  upsertLocation: (payload: { telegramId: number; latitude: number; longitude: number; accuracy?: number }) => {
    return postJson<{ ok: boolean }>("/locations", payload);
  },

  getNearby: (
    latitude: number,
    longitude: number,
    telegramId?: number,
  ) => {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude)
    });
    if (typeof telegramId === "number") {
      params.set("telegramId", String(telegramId));
    }
    return getJson<NearbyResponse>(`/communities/nearby?${params.toString()}`);
  },

  getCommunityPeople: (params: { city?: string; latitude?: number; longitude?: number }) => {
    const search = new URLSearchParams();
    if (params.city) {
      search.set("city", params.city);
    }
    if (typeof params.latitude === "number" && typeof params.longitude === "number") {
      search.set("latitude", String(params.latitude));
      search.set("longitude", String(params.longitude));
    }

    return getJson<{ ok: boolean; people: CommunityPerson[] }>(`/communities/people?${search.toString()}`);
  },

  searchCities: (query: string, signal?: AbortSignal, userLocation?: { latitude: number; longitude: number }) => {
    const params = new URLSearchParams({ q: query });
    if (userLocation) {
      params.set("userLat", String(userLocation.latitude));
      params.set("userLng", String(userLocation.longitude));
    }
    return getJson<CitySearchResponse>(`/api/cities/search?${params.toString()}`, signal);
  },

  saveLocation: (payload: LocationSave) => {
    return postJson<{ ok: boolean }>("/api/location/save", payload);
  }
};