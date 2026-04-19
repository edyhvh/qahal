import type { AppFlowState } from "./types";

export const PAPER_ARTBOARDS = {
  onboardingCarousel: { id: "KQ-0", name: "Qahal Onboarding Carousel" },
  onboardingQuestions: { id: "3BY-0", name: "Onboarding Questions" },
  onboardingData: { id: "3QZ-0", name: "Onboarding Data" },
  map: { id: "3U5-0", name: "Map Screen" },
  home: { id: "4RP-0", name: "Home Screen" }
} as const;

export const resolvePaperScreenKey = (state: AppFlowState): string => {
  if (state.screen === "onboarding-carousel") {
    return `${PAPER_ARTBOARDS.onboardingCarousel.id}:slide-1`;
  }

  if (state.screen === "onboarding-questions") {
    return `${PAPER_ARTBOARDS.onboardingQuestions.id}:step-${state.questionStep + 1}`;
  }

  if (state.screen === "onboarding-data") {
    return `${PAPER_ARTBOARDS.onboardingData.id}:data-entry`;
  }

  if (state.screen === "map") {
    return `${PAPER_ARTBOARDS.map.id}:${state.mapVariant}`;
  }

  if (state.screen === "profile") {
    return `${PAPER_ARTBOARDS.home.id}:profile`;
  }

  return `${PAPER_ARTBOARDS.home.id}:${state.homeVariant}`;
};