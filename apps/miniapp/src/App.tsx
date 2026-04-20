import { OnboardingCarouselScreen } from "./features/onboarding/OnboardingCarouselScreen";
import { OnboardingQuestionsScreen } from "./features/onboarding/OnboardingQuestionsScreen";
import { OnboardingDataScreen } from "./features/onboarding/OnboardingDataScreen";
import { MapScreen } from "./features/map/MapScreen";
import { HomeScreen } from "./features/home/HomeScreen";
import { ProfileScreen } from "./features/profile/ProfileScreen";
import { useAppFlow } from "./app/useAppFlow";
import { resolvePaperScreenKey } from "./app/paperMapping";
import { I18nProvider } from "./app/i18n";

export default function App() {
  const {
    runtimeTarget,
    profileTestingEnabled,
    state,
    busy,
    communities,
    effectiveProfile,
    localProfileRole,
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
    resetLocalData,
    localDataResetEnabled,
    setMapCity,
    setLanguageCode,
  } = useAppFlow();
  const paperScreenKey = resolvePaperScreenKey(state);

  return (
    <I18nProvider
      languageCode={state.answers.languageCode}
      onLanguageCodeChange={setLanguageCode}
    >
      <div
        className="relative mx-auto min-h-[100dvh] max-w-[375px]"
        data-paper-screen={paperScreenKey}
        data-runtime={runtimeTarget}
      >
        {profileTestingEnabled ? (
          <div className="pointer-events-none absolute left-1/2 top-3 z-[70] -translate-x-1/2">
            <label
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#C9A46F66] bg-[#1C2525CC] px-3 py-2 text-xs text-[#F5F0E8] backdrop-blur"
              htmlFor="debug-language-switcher"
            >
              <span>Language</span>
              <select
                id="debug-language-switcher"
                value={state.answers.languageCode}
                onChange={(event) =>
                  setLanguageCode(event.target.value as "en" | "es" | "he")
                }
                className="rounded-md border border-[#C9A46F66] bg-[#1C2525] px-2 py-1 text-xs text-[#F5F0E8] outline-none"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="he">Hebrew</option>
              </select>
            </label>
          </div>
        ) : null}

        {state.screen === "onboarding-carousel" ? (
          <OnboardingCarouselScreen onStart={startQuestions} />
        ) : null}

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
            onSubmit={async (
              firstName,
              city,
              languageCode,
              cityCoordinates,
            ) => {
              setLanguageCode(languageCode);
              updateProfile(firstName, city, languageCode, cityCoordinates);
              await finishOnboarding({
                firstName,
                city,
                languageCode,
                cityCoordinates,
              });
            }}
          />
        ) : null}

        {state.screen === "map" ? (
          <MapScreen
            variant={state.mapVariant}
            communities={communities}
            onVariantChange={setMapVariant}
            onGoHome={goToHome}
            onGoProfile={goToProfile}
            cityName={state.answers.city}
            onCityChange={({ name, latitude, longitude }) => {
              setMapCity(name, { latitude, longitude });
            }}
            initialCenter={
              typeof state.answers.cityLatitude === "number" &&
              typeof state.answers.cityLongitude === "number"
                ? [state.answers.cityLatitude, state.answers.cityLongitude]
                : undefined
            }
          />
        ) : null}

        {state.screen === "home" ? (
          <HomeScreen
            variant={state.homeVariant}
            communities={communities}
            onVariantChange={setHomeVariant}
            onGoMap={goToMap}
            onGoProfile={goToProfile}
            profileTestingEnabled={profileTestingEnabled}
            effectiveProfile={effectiveProfile}
          />
        ) : null}

        {state.screen === "profile" ? (
          <ProfileScreen
            profileTestingEnabled={profileTestingEnabled}
            localProfileRole={localProfileRole}
            onRoleChange={setLocalProfileRole}
            profileName={effectiveProfile.displayName}
            profileQahalName={effectiveProfile.qahalName}
            profileBadges={effectiveProfile.badges}
            onProfileNameChange={setLocalProfileName}
            confirmedBirthDate={confirmedBirthDate}
            onConfirmBirthDate={setConfirmedBirthDate}
            canResetLocalData={localDataResetEnabled}
            onResetLocalData={resetLocalData}
            onGoHome={goToHome}
            onGoMap={goToMap}
          />
        ) : null}
      </div>
    </I18nProvider>
  );
}
