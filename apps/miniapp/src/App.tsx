import { OnboardingCarouselScreen } from "./features/onboarding/OnboardingCarouselScreen";
import { OnboardingQuestionsScreen } from "./features/onboarding/OnboardingQuestionsScreen";
import { OnboardingDataScreen } from "./features/onboarding/OnboardingDataScreen";
import { MapScreen } from "./features/map/MapScreen";
import { HomeScreen } from "./features/home/HomeScreen";
import { useAppFlow } from "./app/useAppFlow";
import { resolvePaperScreenKey } from "./app/paperMapping";

export default function App() {
  const {
    runtimeTarget,
    state,
    busy,
    communities,
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
    setMapCity
  } = useAppFlow();
  const paperScreenKey = resolvePaperScreenKey(state);

  return (
    <div className="mx-auto min-h-[100dvh] max-w-[375px]" data-paper-screen={paperScreenKey} data-runtime={runtimeTarget}>
      {state.screen === "onboarding-carousel" ? <OnboardingCarouselScreen onStart={startQuestions} /> : null}

        {state.screen === "onboarding-questions" ? (
          <OnboardingQuestionsScreen
            step={state.questionStep}
            progressLabel={questionProgress}
            selectedValue={state.answers.values[state.questionStep]}
            onSelect={answerQuestion}
            onNext={nextQuestion}
            onBack={previousQuestion}
            onExit={goToCarousel}
          />
        ) : null}

        {state.screen === "onboarding-data" ? (
          <OnboardingDataScreen
            telegramId={state.telegramId}
            initialFirstName={state.answers.firstName}
            initialCity={state.answers.city}
            initialLanguageCode={state.answers.languageCode}
            busy={busy}
            onSubmit={async (firstName, city, languageCode, cityCoordinates) => {
              updateProfile(firstName, city, languageCode, cityCoordinates);
              await finishOnboarding({ firstName, city, languageCode, cityCoordinates });
            }}
          />
        ) : null}

        {state.screen === "map" ? (
          <MapScreen
            variant={state.mapVariant}
            communities={communities}
            onVariantChange={setMapVariant}
            onGoHome={goToHome}
            cityName={state.answers.city}
            onCityChange={({ name, latitude, longitude }) => {
              setMapCity(name, { latitude, longitude });
            }}
            initialCenter={
              typeof state.answers.cityLatitude === "number" && typeof state.answers.cityLongitude === "number"
                ? [state.answers.cityLatitude, state.answers.cityLongitude]
                : undefined
            }
          />
        ) : null}

        {state.screen === "home" ? (
          <HomeScreen variant={state.homeVariant} communities={communities} onVariantChange={setHomeVariant} onGoMap={goToMap} />
        ) : null}
    </div>
  );
}
