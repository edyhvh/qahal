import { createContext, useContext, useMemo } from "react";
import { messagesByLocale, resolveLocaleFromLanguageCode } from "./messages";
import type { LanguageCode, AppLocale, Messages } from "./types";

const I18nContext = createContext<{
  languageCode: LanguageCode;
  locale: AppLocale;
  setLanguageCode: (languageCode: LanguageCode) => void;
  t: Messages;
} | null>(null);

export const I18nProvider = ({
  languageCode,
  onLanguageCodeChange,
  children,
}: {
  languageCode: LanguageCode;
  onLanguageCodeChange: (languageCode: LanguageCode) => void;
  children: React.ReactNode;
}) => {
  const locale = resolveLocaleFromLanguageCode(languageCode);

  const contextValue = useMemo(() => {
    return {
      languageCode,
      locale,
      setLanguageCode: onLanguageCodeChange,
      t: messagesByLocale[locale],
    };
  }, [languageCode, locale, onLanguageCodeChange]);

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
};

export const getBadgeLocalized = (
  t: Messages,
  badgeName: string,
): { name: string; desc: string; kind: string; years?: number } => {
  const yearsMatch = badgeName.match(/^Years in Emunah\s*(?:\((\d+)\)|:\s*(\d+))$/i);
  if (yearsMatch) {
    const years = Number(yearsMatch[1] ?? yearsMatch[2] ?? 0);
    const safeYears = Number.isFinite(years) ? years : 0;
    return {
      kind: "years",
      years: safeYears,
      name: t.badges.yearsName(safeYears),
      desc: t.badges.yearsDesc,
    };
  }

  if (badgeName === "Emunah") {
    return { kind: "emunah", name: t.badges.emunahName, desc: t.badges.emunahDesc };
  }
  if (badgeName === "Kehilah") {
    return { kind: "kehilah", name: t.badges.kehilahName, desc: t.badges.kehilahDesc };
  }
  if (badgeName === "Messenger") {
    return { kind: "messenger", name: t.badges.messengerName, desc: t.badges.messengerDesc };
  }
  if (badgeName === "Hebrew Teacher") {
    return {
      kind: "hebrew-teacher",
      name: t.badges.hebrewTeacherName,
      desc: t.badges.hebrewTeacherDesc,
    };
  }
  if (badgeName === "Hebrew Student") {
    return {
      kind: "hebrew-student",
      name: t.badges.hebrewStudentName,
      desc: t.badges.hebrewStudentDesc,
    };
  }

  return {
    kind: "generic",
    name: badgeName,
    desc: t.badges.genericDesc,
  };
};

export type { LanguageCode, AppLocale, Messages } from "./types";
