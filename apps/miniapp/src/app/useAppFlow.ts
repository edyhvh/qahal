import { useEffect, useMemo, useState } from "react";
import type { CommunityCard, OnboardingSubmit } from "@qahal/shared";
import { getLocalProfileRoleOption } from "./types";
import type {
  AppFlowState,
  HomeVariant,
  LocalProfileRole,
  MapVariant,
} from "./types";
import { api } from "../lib/api";
import { getTelegramWebApp } from "../lib/telegram";
import { detectRuntimeTarget, getWebGuestId } from "../lib/runtime";
import { isProfileTestingEnabled } from "../lib/env";

const TOTAL_QUESTION_STEPS = 9;

const getTelegramId = (): number => {
  const webApp = getTelegramWebApp();
  const userCandidate = (
    webApp?.initDataUnsafe as { user?: { id?: number } } | undefined
  )?.user;
  return typeof userCandidate?.id === "number"
    ? userCandidate.id
    : getWebGuestId();
};

export const useAppFlow = () => {
  const runtimeTarget = detectRuntimeTarget();
  const profileTestingEnabled = isProfileTestingEnabled();
  const [state, setState] = useState<AppFlowState>({
    screen: "onboarding-carousel",
    questionStep: 0,
    answers: {
      values: {},
      firstName: "",
      city: "",
      cityLatitude: undefined,
      cityLongitude: undefined,
      languageCode: "en",
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

  useEffect(() => {
    const roleOption = getLocalProfileRoleOption(localProfileRole);
    setLocalProfileName((prev) => {
      const previousDefaults = [
        getLocalProfileRoleOption("none").defaultDisplayName,
        getLocalProfileRoleOption("member").defaultDisplayName,
        getLocalProfileRoleOption("leader").defaultDisplayName,
      ];
      return previousDefaults.includes(prev)
        ? roleOption.defaultDisplayName
        : prev;
    });
  }, [localProfileRole]);

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
    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        firstName,
        city,
        cityLatitude: cityCoordinates?.latitude,
        cityLongitude: cityCoordinates?.longitude,
        languageCode,
      },
    }));
  };

  const finishOnboarding = async (profile?: {
    firstName: string;
    city: string;
    languageCode: "en" | "es" | "he";
    cityCoordinates?: { latitude: number; longitude: number };
  }) => {
    const finalFirstName = profile?.firstName ?? state.answers.firstName;
    const finalCity = profile?.city ?? state.answers.city;
    const finalLanguageCode =
      profile?.languageCode ?? state.answers.languageCode;
    const finalCityLatitude =
      profile?.cityCoordinates?.latitude ?? state.answers.cityLatitude;
    const finalCityLongitude =
      profile?.cityCoordinates?.longitude ?? state.answers.cityLongitude;

    const payload: OnboardingSubmit = {
      telegramId: state.telegramId,
      firstName: finalFirstName,
      city: finalCity,
      languageCode: finalLanguageCode,
    };

    setBusy(true);
    try {
      try {
        await api.submitOnboarding(payload);
        if (
          typeof finalCityLatitude === "number" &&
          typeof finalCityLongitude === "number"
        ) {
          const nearby = await api.getNearby(
            finalCityLatitude,
            finalCityLongitude,
          );
          setCommunities(nearby.communities);
        } else {
          setCommunities([]);
        }
      } catch {
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
    } finally {
      setBusy(false);
    }
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

  return {
    runtimeTarget,
    profileTestingEnabled,
    state,
    busy,
    communities,
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
    setLocalProfileRole,
    setLocalProfileName,
    setConfirmedBirthDate,
    setMapCity,
  };
};
