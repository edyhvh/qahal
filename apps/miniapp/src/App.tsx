import { OnboardingCarouselScreen } from "./features/onboarding/OnboardingCarouselScreen";
import { OnboardingQuestionsScreen } from "./features/onboarding/OnboardingQuestionsScreen";
import { OnboardingDataScreen } from "./features/onboarding/OnboardingDataScreen";
import { MapScreen } from "./features/map/MapScreen";
import { HomeScreen } from "./features/home/HomeScreen";
import { ProfileScreen } from "./features/profile/ProfileScreen";
import { useAppFlow } from "./app/useAppFlow";
import { resolvePaperScreenKey } from "./app/paperMapping";
import { I18nProvider } from "./app/i18n";
import { getNextThemeMode, type ThemeMode } from "./app/theme";

interface AppProps {
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

export default function App({ themeMode, onThemeChange }: AppProps) {
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
        data-theme-mode={themeMode}
      >
        <button
          type="button"
          onClick={() => onThemeChange(getNextThemeMode(themeMode))}
          className="absolute right-3 top-3 z-[85] flex h-10 w-10 items-center justify-center rounded-full border"
          style={{
            borderColor: "var(--theme-toggle-border)",
            background: "var(--theme-toggle-bg)",
            color: "var(--theme-toggle-icon)",
            boxShadow: "var(--theme-toggle-shadow)",
            backdropFilter: "blur(8px)",
          }}
          aria-label={
            themeMode === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
          title={themeMode === "light" ? "Dark mode" : "Light mode"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M9 14.5H15M9.5 17.5H14.5M12 3C8.96 3 6.5 5.46 6.5 8.5C6.5 10.37 7.43 12.02 8.86 13V14.5C8.86 15.33 9.53 16 10.36 16H13.64C14.47 16 15.14 15.33 15.14 14.5V13C16.57 12.02 17.5 10.37 17.5 8.5C17.5 5.46 15.04 3 12 3Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

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
            themeMode={themeMode}
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
