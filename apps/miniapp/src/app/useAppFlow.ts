import { useEffect, useMemo, useState } from "react";
import type { CommunityCard, OnboardingSubmit } from "@qahal/shared";
import { getLocalProfileRoleOption } from "./types";
import type {
  AppFlowState,
  EffectiveProfileSnapshot,
  HomeVariant,
  LocalProfileRole,
  MapVariant,
} from "./types";
import { api, type ManagedCommunity } from "../lib/api";
import { getTelegramWebApp } from "../lib/telegram";
import {
  clearWebGuestId,
  detectRuntimeTarget,
  getWebGuestId,
} from "../lib/runtime";
import { isProfileTestingEnabled } from "../lib/env";

const TOTAL_QUESTION_STEPS = 9;
const EMUNAH_BADGE_LABEL = "Emunah";

const resolveLanguageCode = (value: unknown): "en" | "es" | "he" => {
  if (value === "es" || value === "he" || value === "en") {
    return value;
  }
  return "en";
};

const DEFAULT_ROLE_DISPLAY_NAMES = [
  getLocalProfileRoleOption("none").defaultDisplayName,
  getLocalProfileRoleOption("member").defaultDisplayName,
  getLocalProfileRoleOption("leader").defaultDisplayName,
];

const sanitizeProfileName = (name: string): string => {
  return name
    .replace(/\s+/g, " ")
    .replace(/[^a-zA-Z\s'\-.]/g, "")
    .trim()
    .slice(0, 40);
};

const shouldAutoAdoptFirstName = (currentName: string): boolean => {
  const normalized = currentName.trim();
  return !normalized || DEFAULT_ROLE_DISPLAY_NAMES.includes(normalized);
};

const mergeUniqueBadges = (...lists: string[][]): string[] => {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const list of lists) {
    for (const badge of list) {
      if (!badge || seen.has(badge)) {
        continue;
      }
      seen.add(badge);
      merged.push(badge);
    }
  }
  return merged;
};

const shouldGrantEmunahBadge = (answers: Record<string, string>): boolean => {
  const doctrinalSteps = ["1", "2", "3", "4", "5", "6", "7"];
  return doctrinalSteps.every((stepKey) => {
    return String(answers[stepKey] ?? "").trim().toLowerCase() === "yes";
  });
};

const getTelegramId = (): number => {
  const webApp = getTelegramWebApp();
  const userCandidate = (
    webApp?.initDataUnsafe as { user?: { id?: number } } | undefined
  )?.user;
  return typeof userCandidate?.id === "number"
    ? userCandidate.id
    : getWebGuestId();
};

const getInitialLanguageCode = (): "en" | "es" | "he" => {
  const webApp = getTelegramWebApp();
  const userCandidate = (
    webApp?.initDataUnsafe as { user?: { language_code?: string } } | undefined
  )?.user;

  const normalized = String(userCandidate?.language_code ?? "")
    .trim()
    .toLowerCase();

  if (normalized.startsWith("es")) {
    return "es";
  }

  if (normalized.startsWith("he")) {
    return "he";
  }

  return "en";
};

export const useAppFlow = () => {
  const runtimeTarget = detectRuntimeTarget();
  const profileTestingEnabled = isProfileTestingEnabled();
  const [telegramIdentityReady, setTelegramIdentityReady] = useState(
    runtimeTarget !== "telegram",
  );
  const [state, setState] = useState<AppFlowState>({
    screen: "onboarding-carousel",
    questionStep: 0,
    answers: {
      values: {},
      firstName: "",
      city: "",
      cityLatitude: undefined,
      cityLongitude: undefined,
      languageCode: getInitialLanguageCode(),
    },
    mapVariant: "allowed",
    homeVariant: "default",
    telegramId: getTelegramId(),
  });
  const [communities, setCommunities] = useState<CommunityCard[]>([]);
  const [busy, setBusy] = useState(false);
  const [localProfileRole, setLocalProfileRole] =
    useState<LocalProfileRole>("none");
  const [localProfileName, setLocalProfileName] = useState<string>(
    getLocalProfileRoleOption("none").defaultDisplayName,
  );
  const [confirmedBirthDate, setConfirmedBirthDate] = useState<string | null>(
    null,
  );
  const [persistedBadges, setPersistedBadges] = useState<string[]>([]);
  const [persistedQahalName, setPersistedQahalName] = useState<string | null>(
    null,
  );
  const [persistedCanCreateQahal, setPersistedCanCreateQahal] = useState<
    boolean | null
  >(null);
  const [persistedCanManageQahal, setPersistedCanManageQahal] = useState<
    boolean | null
  >(null);
  const [persistedManagedCommunityId, setPersistedManagedCommunityId] =
    useState<number | null>(null);
  const [managedCommunity, setManagedCommunity] = useState<ManagedCommunity | null>(
    null,
  );
  const localDataResetEnabled = profileTestingEnabled;

  useEffect(() => {
    const roleOption = getLocalProfileRoleOption(localProfileRole);
    setLocalProfileName((prev) => {
      return DEFAULT_ROLE_DISPLAY_NAMES.includes(prev)
        ? roleOption.defaultDisplayName
        : prev;
    });
  }, [localProfileRole]);

  useEffect(() => {
    if (runtimeTarget !== "telegram") {
      return;
    }

    let cancelled = false;

    const verifyTelegramIdentity = async () => {
      const webApp = getTelegramWebApp();
      const initData = webApp?.initData?.trim();

      if (!initData) {
        if (!cancelled) {
          setTelegramIdentityReady(true);
        }
        return;
      }

      try {
        const response = await api.verifyTelegramInitData(initData);
        if (cancelled) {
          return;
        }

        const user = response.user;
        if (user && typeof user.telegramId === "number") {
          setState((prev) => ({
            ...prev,
            telegramId: user.telegramId,
            answers: {
              ...prev.answers,
              languageCode:
                user.languageCode === "es" ||
                user.languageCode === "he" ||
                user.languageCode === "en"
                  ? user.languageCode
                  : prev.answers.languageCode,
            },
          }));
        }
      } catch {
        // Keep app usable in local dev and preview URLs even when verify is unavailable.
      } finally {
        if (!cancelled) {
          setTelegramIdentityReady(true);
        }
      }
    };

    void verifyTelegramIdentity();

    return () => {
      cancelled = true;
    };
  }, [runtimeTarget]);

  useEffect(() => {
    if (!telegramIdentityReady) {
      return;
    }

    let cancelled = false;

    const loadPersistedProfile = async () => {
      try {
        const response = await api.getUser(state.telegramId);
        if (cancelled || !response.user) {
          return;
        }

        const user = response.user;
        const persistedFirstName = sanitizeProfileName(user.firstName ?? "");

        setPersistedBadges(Array.isArray(user.badges) ? user.badges : []);
        setPersistedQahalName(
          typeof user.qahalName === "string" && user.qahalName.trim().length > 0
            ? user.qahalName
            : null,
        );
        setPersistedManagedCommunityId(
          typeof user.managedCommunityId === "number"
            ? user.managedCommunityId
            : null,
        );
        setPersistedCanManageQahal(
          typeof user.canManageQahal === "boolean"
            ? user.canManageQahal
            : null,
        );
        setPersistedCanCreateQahal(
          typeof user.canCreateQahal === "boolean"
            ? user.canCreateQahal
            : null,
        );

        if (typeof user.birthDate === "string" && user.birthDate) {
          setConfirmedBirthDate(user.birthDate);
        }

        if (persistedFirstName) {
          setLocalProfileName((prev) => {
            if (shouldAutoAdoptFirstName(prev)) {
              return persistedFirstName;
            }
            return prev;
          });
        }

        const hasOnboarding = Boolean(user.onboardingCompleted);
        if (!hasOnboarding) {
          return;
        }

        setState((prev) => ({
          ...prev,
          screen: "home",
          answers: {
            ...prev.answers,
            firstName: persistedFirstName || prev.answers.firstName,
            city: user.city ?? prev.answers.city,
            languageCode:
              user.languageCode === "es" ||
              user.languageCode === "he" ||
              user.languageCode === "en"
                ? user.languageCode
                : prev.answers.languageCode,
            cityLatitude:
              typeof user.latestLatitude === "number"
                ? user.latestLatitude
                : prev.answers.cityLatitude,
            cityLongitude:
              typeof user.latestLongitude === "number"
                ? user.latestLongitude
                : prev.answers.cityLongitude,
          },
        }));

        if (
          typeof user.latestLatitude === "number" &&
          typeof user.latestLongitude === "number"
        ) {
          const nearby = await api.getNearby(
            user.latestLatitude,
            user.latestLongitude,
            state.telegramId,
          );
          if (!cancelled) {
            setCommunities(nearby.communities);
          }
        }

        if (user.canManageQahal) {
          try {
            const managed = await api.getManagedCommunity(state.telegramId);
            if (!cancelled) {
              setManagedCommunity(managed);
            }
          } catch {
            if (!cancelled) {
              setManagedCommunity(null);
            }
          }
        }
      } catch {
        // Keep UI operational when local worker is not running.
      }
    };

    void loadPersistedProfile();

    return () => {
      cancelled = true;
    };
  }, [state.telegramId, telegramIdentityReady]);

  const effectiveProfile = useMemo<EffectiveProfileSnapshot>(() => {
    const fallbackName = sanitizeProfileName(localProfileName);
    const onboardingName = sanitizeProfileName(state.answers.firstName);
    const displayName =
      fallbackName ||
      onboardingName ||
      getLocalProfileRoleOption("none").defaultDisplayName;

    if (profileTestingEnabled) {
      if (localProfileRole === "none") {
        const noCongregation = getLocalProfileRoleOption("none");
        return {
          displayName,
          qahalName: noCongregation.qahalName,
          badges: mergeUniqueBadges(persistedBadges),
          hasCongregation: false,
          canCreateQahal: true,
          canManageQahal: false,
          managedCommunityId: null,
        };
      }

      const selectedRole = getLocalProfileRoleOption(localProfileRole);
      const canManageQahal = localProfileRole === "leader";
      const managedCommunityId =
        canManageQahal && typeof persistedManagedCommunityId === "number"
          ? persistedManagedCommunityId
          : null;
      return {
        displayName,
        qahalName: selectedRole.qahalName,
        badges: mergeUniqueBadges(persistedBadges, selectedRole.badges),
        hasCongregation: true,
        canCreateQahal: false,
        canManageQahal,
        managedCommunityId,
      };
    }

    const memberCommunity = communities.find(
      (community) => community.memberState === "member",
    );
    const canManageQahal =
      persistedCanManageQahal === true ||
      (typeof persistedManagedCommunityId === "number" &&
        persistedManagedCommunityId > 0);
    const canCreateQahal =
      typeof persistedCanCreateQahal === "boolean"
        ? persistedCanCreateQahal
        : !memberCommunity && !canManageQahal;

    if (memberCommunity) {
      return {
        displayName,
        qahalName: memberCommunity.name,
        badges:
          persistedBadges.length > 0
            ? persistedBadges
            : getLocalProfileRoleOption("member").badges,
        hasCongregation: true,
        canCreateQahal,
        canManageQahal,
        managedCommunityId: persistedManagedCommunityId,
      };
    }

    const noCongregation = getLocalProfileRoleOption("none");
    return {
      displayName,
      qahalName: persistedQahalName ?? noCongregation.qahalName,
      badges:
        persistedBadges.length > 0 ? persistedBadges : noCongregation.badges,
      hasCongregation: false,
      canCreateQahal,
      canManageQahal,
      managedCommunityId: persistedManagedCommunityId,
    };
  }, [
    communities,
    localProfileName,
    localProfileRole,
    persistedBadges,
    persistedCanCreateQahal,
    persistedCanManageQahal,
    persistedManagedCommunityId,
    persistedQahalName,
    profileTestingEnabled,
    state.answers.firstName,
  ]);

  const questionProgress = useMemo(() => {
    return `${state.questionStep + 1}/${TOTAL_QUESTION_STEPS}`;
  }, [state.questionStep]);

  const startQuestions = () => {
    setState((prev) => ({ ...prev, screen: "onboarding-questions" }));
  };

  const answerQuestion = (value: string) => {
    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        values: {
          ...prev.answers.values,
          [prev.questionStep]: value,
        },
      },
    }));
  };

  const nextQuestion = () => {
    setState((prev) => {
      const currentAnswer = prev.answers.values[prev.questionStep];

      // Answered "no" → jump to disagreement screen (last step)
      if (currentAnswer === "no") {
        return { ...prev, questionStep: TOTAL_QUESTION_STEPS - 1 };
      }

      // Last real question answered "yes" → proceed to data screen
      if (prev.questionStep >= TOTAL_QUESTION_STEPS - 2) {
        return { ...prev, screen: "onboarding-data" };
      }

      return { ...prev, questionStep: prev.questionStep + 1 };
    });
  };

  const previousQuestion = () => {
    setState((prev) => ({
      ...prev,
      questionStep: Math.max(0, prev.questionStep - 1),
    }));
  };

  const updateProfile = (
    firstName: string,
    city: string,
    languageCode: "en" | "es" | "he",
    cityCoordinates?: { latitude: number; longitude: number },
  ) => {
    const cleanedFirstName = sanitizeProfileName(firstName);
    const cleanedCity = city.trim();

    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        firstName: cleanedFirstName,
        city: cleanedCity,
        cityLatitude: cityCoordinates?.latitude,
        cityLongitude: cityCoordinates?.longitude,
        languageCode,
      },
    }));

    setLocalProfileName((prev) => {
      if (!shouldAutoAdoptFirstName(prev)) {
        return prev;
      }

      return cleanedFirstName || prev;
    });
  };

  const finishOnboarding = async (profile?: {
    firstName: string;
    city: string;
    languageCode: "en" | "es" | "he";
    cityCoordinates?: { latitude: number; longitude: number };
  }) => {
    const finalFirstName = sanitizeProfileName(
      profile?.firstName ?? state.answers.firstName,
    );
    const finalCity = (profile?.city ?? state.answers.city).trim();
    const finalLanguageCode =
      profile?.languageCode ?? state.answers.languageCode;
    const finalCityLatitude =
      profile?.cityCoordinates?.latitude ?? state.answers.cityLatitude;
    const finalCityLongitude =
      profile?.cityCoordinates?.longitude ?? state.answers.cityLongitude;

    const payload: OnboardingSubmit = {
      telegramId: state.telegramId,
      firstName: finalFirstName,
      languageCode: finalLanguageCode,
      answers: Object.fromEntries(
        Object.entries(state.answers.values).map(([step, value]) => [
          String(step),
          String(value),
        ]),
      ),
    };

    if (finalCity) {
      payload.city = finalCity;
    }

    const shouldGrantEmunah = shouldGrantEmunahBadge(payload.answers ?? {});

    setBusy(true);
    try {
      try {
        const onboarding = await api.submitOnboarding(payload);
        if (shouldGrantEmunah) {
          setPersistedBadges((prev) =>
            mergeUniqueBadges(prev, [EMUNAH_BADGE_LABEL]),
          );
        }
        if (onboarding.user?.badges && Array.isArray(onboarding.user.badges)) {
          const userBadges = onboarding.user.badges;
          setPersistedBadges((prev) =>
            shouldGrantEmunah
              ? mergeUniqueBadges(prev, userBadges, [EMUNAH_BADGE_LABEL])
              : mergeUniqueBadges(prev, userBadges),
          );
        }
        if (typeof onboarding.user?.qahalName === "string") {
          setPersistedQahalName(onboarding.user.qahalName);
        }
        if (
          typeof finalCityLatitude === "number" &&
          typeof finalCityLongitude === "number"
        ) {
          const nearby = await api.getNearby(
            finalCityLatitude,
            finalCityLongitude,
            state.telegramId,
          );
          setCommunities(nearby.communities);
        } else {
          setCommunities([]);
        }
      } catch {
        if (shouldGrantEmunah) {
          setPersistedBadges((prev) =>
            mergeUniqueBadges(prev, [EMUNAH_BADGE_LABEL]),
          );
        }
        setCommunities([]);
      }

      setState((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          firstName: finalFirstName,
          city: finalCity,
          cityLatitude: finalCityLatitude,
          cityLongitude: finalCityLongitude,
          languageCode: finalLanguageCode,
        },
        screen: "map",
        mapVariant: "allowed",
      }));

      setLocalProfileName((prev) => {
        if (!shouldAutoAdoptFirstName(prev)) {
          return prev;
        }

        return finalFirstName || prev;
      });
    } finally {
      setBusy(false);
    }
  };

  const updateLocalProfileName = (name: string) => {
    const safeName = sanitizeProfileName(name);
    if (!safeName) {
      return;
    }

    setLocalProfileName(safeName);
    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        firstName: safeName,
      },
    }));

    void api
      .updateUserProfile(state.telegramId, {
        firstName: safeName,
      })
      .catch(() => {
        // Keep local optimistic update if backend is temporarily unavailable.
      });
  };

  const updateConfirmedBirthDate = (birthDate: string | null) => {
    setConfirmedBirthDate(birthDate);
    if (!birthDate) {
      return;
    }

    void api
      .updateUserProfile(state.telegramId, {
        birthDate,
      })
      .catch(() => {
        // Keep local optimistic update if backend is temporarily unavailable.
      });
  };

  const resetLocalData = async () => {
    if (!localDataResetEnabled) {
      return;
    }

    try {
      await api.resetLocalUser(state.telegramId);
    } catch {
      // Proceed with local identity reset even if API reset fails.
    }

    clearWebGuestId();
    window.location.reload();
  };

  const setMapVariant = (variant: MapVariant) => {
    setState((prev) => ({ ...prev, mapVariant: variant }));
  };

  const setHomeVariant = (variant: HomeVariant) => {
    setState((prev) => ({ ...prev, homeVariant: variant }));
  };

  const goToCarousel = () => {
    setState((prev) => ({
      ...prev,
      screen: "onboarding-carousel",
      questionStep: 0,
    }));
  };

  const goToHome = () => {
    setState((prev) => ({ ...prev, screen: "home" }));
  };

  const goToMap = () => {
    setState((prev) => ({ ...prev, screen: "map" }));
  };

  const goToProfile = () => {
    setState((prev) => ({ ...prev, screen: "profile" }));
  };

  const goToManageQahal = () => {
    setState((prev) => ({ ...prev, screen: "manage-qahal" }));
  };

  const setMapCity = (
    city: string,
    cityCoordinates: { latitude: number; longitude: number },
  ) => {
    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        city,
        cityLatitude: cityCoordinates.latitude,
        cityLongitude: cityCoordinates.longitude,
      },
    }));
  };

  const setLanguageCode = (languageCode: "en" | "es" | "he") => {
    const safeLanguageCode = resolveLanguageCode(languageCode);
    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        languageCode: safeLanguageCode,
      },
    }));
  };

  return {
    runtimeTarget,
    profileTestingEnabled,
    state,
    busy,
    communities,
    effectiveProfile,
    localProfileRole,
    localProfileName,
    confirmedBirthDate,
    questionProgress,
    startQuestions,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToCarousel,
    updateProfile,
    finishOnboarding,
    setMapVariant,
    setHomeVariant,
    goToHome,
    goToMap,
    goToProfile,
    goToManageQahal,
    setLocalProfileRole,
    setLocalProfileName: updateLocalProfileName,
    setConfirmedBirthDate: updateConfirmedBirthDate,
    resetLocalData,
    localDataResetEnabled,
    setMapCity,
    setLanguageCode,
    managedCommunity,
  };
};
