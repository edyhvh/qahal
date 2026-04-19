export type RootScreen = "onboarding-carousel" | "onboarding-questions" | "onboarding-data" | "map" | "home" | "profile";

export type MapVariant = "allowed" | "selected" | "no-permission";

export type HomeVariant = "default" | "already-member" | "already-requested" | "join-requested" | "qahal-exists";

export type LocalProfileRole = "none" | "member" | "leader";

export interface OnboardingAnswers {
  values: Record<number, string>;
  firstName: string;
  city: string;
  cityLatitude?: number;
  cityLongitude?: number;
  languageCode: "en" | "es" | "he";
}

export interface AppFlowState {
  screen: RootScreen;
  questionStep: number;
  answers: OnboardingAnswers;
  mapVariant: MapVariant;
  homeVariant: HomeVariant;
  telegramId: number;
}