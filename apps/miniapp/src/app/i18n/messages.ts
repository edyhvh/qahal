import type { AppLocale, LanguageCode, Messages } from "./types";
import { enMessages } from "./locales/en";
import { esMessages } from "./locales/es";

export const messagesByLocale: Record<AppLocale, Messages> = {
  en: enMessages,
  es: esMessages,
};

export const resolveLocaleFromLanguageCode = (
  languageCode: LanguageCode,
): AppLocale => {
  return languageCode === "es" ? "es" : "en";
};
