import { useEffect, useRef, useState } from "react";
import { CitySearch } from "./CitySearch";
import { useI18n } from "../../app/i18n";

interface OnboardingDataScreenProps {
  telegramId: number;
  initialFirstName: string;
  initialCity: string;
  initialLanguageCode: "en" | "es" | "he";
  busy: boolean;
  onSubmit: (
    firstName: string,
    city: string,
    languageCode: "en" | "es" | "he",
    cityCoordinates?: { latitude: number; longitude: number },
  ) => Promise<void>;
}

export const OnboardingDataScreen = ({
  telegramId,
  initialFirstName,
  initialCity,
  initialLanguageCode,
  busy,
  onSubmit,
}: OnboardingDataScreenProps) => {
  const { t, setLanguageCode } = useI18n();
  const normalizedInitialLanguage = initialLanguageCode === "es" ? "es" : "en";
  const [firstName, setFirstName] = useState(initialFirstName);
  const [city, setCity] = useState(initialCity);
  const [cityCoordinates, setCityCoordinates] = useState<
    { latitude: number; longitude: number } | undefined
  >(undefined);
  const [languageCode, setLanguageCodeState] = useState<"en" | "es">(
    normalizedInitialLanguage,
  );
  const [step, setStep] = useState<"name" | "city">("name");
  const [isNameInputFocused, setIsNameInputFocused] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const canContinue = step === "name" ? firstName.trim().length > 0 : true;

  useEffect(() => {
    if (step !== "name") {
      setKeyboardInset(0);
      return;
    }

    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }

    const updateKeyboardInset = () => {
      if (!isNameInputFocused) {
        setKeyboardInset(0);
        return;
      }

      const inset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      // Ignore tiny viewport changes caused by browser chrome animations.
      setKeyboardInset(inset > 80 ? inset : 0);
    };

    updateKeyboardInset();
    viewport.addEventListener("resize", updateKeyboardInset);
    viewport.addEventListener("scroll", updateKeyboardInset);

    return () => {
      viewport.removeEventListener("resize", updateKeyboardInset);
      viewport.removeEventListener("scroll", updateKeyboardInset);
    };
  }, [isNameInputFocused, step]);

  const dismissNameKeyboard = (target: EventTarget | null) => {
    if (step !== "name" || !isNameInputFocused) {
      return;
    }

    const node = target as HTMLElement | null;
    if (!node) {
      return;
    }

    if (node.closest("input, button, [role='button']")) {
      return;
    }

    nameInputRef.current?.blur();
    setIsNameInputFocused(false);
  };

  return (
    <section
      className="relative flex min-h-[100dvh] flex-col overflow-hidden"
      onPointerDownCapture={(event) => dismissNameKeyboard(event.target)}
    >
      {/* Paper: same dark background as questions */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, #2a241e 0%, #1a1612 60%), radial-gradient(circle at 70% 80%, #22201a 0%, #1a1612 50%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, transparent 35%, rgba(10,8,6,0.45) 100%)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-1 flex-col justify-between px-[28px] pt-[56px]"
        style={{
          paddingBottom:
            step === "name" ? `${Math.max(20, 36 + keyboardInset)}px` : "36px",
        }}
      >
        <div className="h-[14px]" />

        {/* Center content */}
        <div className="flex flex-col items-center gap-[32px] px-[8px]">
          {/* Title — Paper 3RP-0 */}
          <h2
            className="qahal-display w-full text-center"
            style={{
              fontSize: 34,
              lineHeight: "120%",
              fontWeight: 600,
              color: "#E8DDD0",
            }}
          >
            {step === "name"
              ? t.onboardingData.nameTitle
              : t.onboardingData.cityTitle}
          </h2>

          {step === "city" && (
            <p
              className="text-center"
              style={{
                fontSize: 14,
                lineHeight: "155%",
                color: "#E8DDD0",
                opacity: 0.6,
                marginTop: -16,
              }}
            >
              {t.onboardingData.cityHint}
            </p>
          )}

          {/* Input — Paper 3TX-0 */}
          {step === "name" ? (
            <input
              ref={nameInputRef}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onFocus={() => setIsNameInputFocused(true)}
              onBlur={() => setIsNameInputFocused(false)}
              placeholder={t.onboardingData.namePlaceholder}
              autoFocus
              style={{
                width: "100%",
                height: 52,
                borderRadius: 14,
                padding: "0 16px",
                background: "#E8DDD00F",
                border: "1.5px solid #C9A46F33",
                fontSize: 15,
                color: "#E8DDD0",
                outline: "none",
              }}
            />
          ) : (
            <CitySearch
              telegramId={telegramId}
              initialValue={city}
              onCitySelected={(suggestion) => {
                setCity(suggestion.city);
                setCityCoordinates({
                  latitude: suggestion.latitude,
                  longitude: suggestion.longitude,
                });
              }}
            />
          )}
        </div>

        {/* Bottom buttons + dots */}
        <div className="flex flex-col gap-[16px]">
          {/* Continue button — Paper 3RH-0 */}
          <button
            type="button"
            disabled={!canContinue || busy}
            onClick={() => {
              if (step === "name") {
                nameInputRef.current?.blur();
                setIsNameInputFocused(false);
                setStep("city");
              } else {
                setLanguageCode(languageCode);
                onSubmit(
                  firstName.trim(),
                  city.trim(),
                  languageCode,
                  cityCoordinates,
                );
              }
            }}
            className="flex shrink-0 items-center justify-center disabled:opacity-40"
            style={{
              height: 52,
              borderRadius: 14,
              background: "#1E5C5A",
              border: "1.5px solid #C9A46F",
              boxShadow: "#1E5C5A40 0px 8px 24px",
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "0.02em",
              color: "#E8DDD0",
            }}
          >
            {busy ? t.onboardingData.saving : t.common.continue}
          </button>

          {step === "name" ? (
            <div className="flex items-center justify-center gap-[10px]">
              <span style={{ fontSize: 13, color: "#E8DDD0", opacity: 0.7 }}>
                {t.onboardingData.languageLabel}
              </span>
              <select
                value={languageCode}
                onChange={(event) => {
                  const nextLanguage = event.target.value as "en" | "es";
                  setLanguageCodeState(nextLanguage);
                  setLanguageCode(nextLanguage);
                }}
                style={{
                  height: 34,
                  borderRadius: 10,
                  border: "1px solid #C9A46F33",
                  background: "#E8DDD00F",
                  color: "#E8DDD0",
                  fontSize: 13,
                  padding: "0 10px",
                }}
              >
                <option value="en">{t.onboardingData.languageEnglish}</option>
                <option value="es">{t.onboardingData.languageSpanish}</option>
              </select>
            </div>
          ) : null}

          {step === "city" && (
            <button
              type="button"
              onClick={() => setStep("name")}
              className="flex shrink-0 items-center justify-center"
              style={{
                height: 44,
                fontSize: 14,
                fontWeight: 500,
                color: "#E8DDD0",
                opacity: 0.5,
              }}
            >
              {t.common.back}
            </button>
          )}

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-[6px] py-[4px]">
            <span
              className="shrink-0 rounded-[99px]"
              style={{
                width: step === "name" ? 24 : 12,
                height: 3,
                background: step === "name" ? "#C9A46F" : "#E8DDD026",
              }}
            />
            <span
              className="shrink-0 rounded-[99px]"
              style={{
                width: step === "city" ? 24 : 12,
                height: 3,
                background: step === "city" ? "#C9A46F" : "#E8DDD026",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
