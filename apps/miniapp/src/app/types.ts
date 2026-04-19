export type RootScreen =
  | "onboarding-carousel"
  | "onboarding-questions"
  | "onboarding-data"
  | "map"
  | "home"
  | "profile";

export type MapVariant = "allowed" | "selected" | "no-permission";

export type HomeVariant =
  | "default"
  | "already-member"
  | "already-requested"
  | "join-requested"
  | "qahal-exists";

export type LocalProfileRole = "none" | "member" | "leader";

export interface LocalProfileRoleOption {
  value: LocalProfileRole;
  label: string;
  description: string;
  defaultDisplayName: string;
  qahalName: string;
  badges: string[];
}

export const LOCAL_PROFILE_ROLE_OPTIONS: LocalProfileRoleOption[] = [
  {
    value: "none",
    label: "No Congregation Yet",
    description: "Can request to join a congregation.",
    defaultDisplayName: "New Pilgrim",
    qahalName: "Not assigned yet",
    badges: ["Seeker", "Neighbor"],
  },
  {
    value: "member",
    label: "Member",
    description: "Already belongs to one congregation.",
    defaultDisplayName: "Ezra Cohen",
    qahalName: "Jerusalem Harbor Qahal",
    badges: ["Torah Student", "Shabbat Host", "Prayer Circle"],
  },
  {
    value: "leader",
    label: "Community Leader",
    description: "Leader of a congregation (member state).",
    defaultDisplayName: "Miriam Levi",
    qahalName: "Jerusalem Harbor Qahal",
    badges: ["Community Leader", "Messenger", "Shabbat Host"],
  },
];

export const getLocalProfileRoleOption = (
  role: LocalProfileRole,
): LocalProfileRoleOption => {
  return (
    LOCAL_PROFILE_ROLE_OPTIONS.find((option) => option.value === role) ??
    LOCAL_PROFILE_ROLE_OPTIONS[0]
  );
};

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
