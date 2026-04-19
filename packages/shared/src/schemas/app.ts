import { z } from "zod";

export const onboardingSubmitSchema = z.object({
  telegramId: z.number().int().positive(),
  firstName: z.string().min(1).max(80),
  city: z.string().min(1).max(120),
  languageCode: z.enum(["en", "es", "he"]).default("en")
});

export const locationUpsertSchema = z.object({
  telegramId: z.number().int().positive(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional()
});

export const citySearchQuerySchema = z
  .object({
    q: z.string().trim().min(2).max(120),
    userLat: z.coerce.number().min(-90).max(90).optional(),
    userLng: z.coerce.number().min(-180).max(180).optional()
  })
  .refine((value) => {
    const hasLat = typeof value.userLat === "number";
    const hasLng = typeof value.userLng === "number";
    return hasLat === hasLng;
  }, {
    message: "userLat and userLng must be provided together"
  });

export const citySuggestionSchema = z.object({
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  label: z.string().min(1)
});

export const citySearchResponseSchema = z.object({
  ok: z.literal(true),
  suggestions: z.array(citySuggestionSchema)
});

export const locationSaveSchema = z.object({
  telegramId: z.number().int().positive(),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  country: z.string().trim().min(1).max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

export const nearbyQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180)
});

export const communityCardSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  city: z.string().min(1),
  distanceKm: z.number().nonnegative(),
  memberState: z.enum(["not_member", "requested", "member"])
});

export const nearbyResponseSchema = z.object({
  ok: z.literal(true),
  communities: z.array(communityCardSchema)
});

export type OnboardingSubmit = z.infer<typeof onboardingSubmitSchema>;
export type LocationUpsert = z.infer<typeof locationUpsertSchema>;
export type CitySearchQuery = z.infer<typeof citySearchQuerySchema>;
export type CitySuggestion = z.infer<typeof citySuggestionSchema>;
export type CitySearchResponse = z.infer<typeof citySearchResponseSchema>;
export type LocationSave = z.infer<typeof locationSaveSchema>;
export type NearbyQuery = z.infer<typeof nearbyQuerySchema>;
export type NearbyResponse = z.infer<typeof nearbyResponseSchema>;
export type CommunityCard = z.infer<typeof communityCardSchema>;