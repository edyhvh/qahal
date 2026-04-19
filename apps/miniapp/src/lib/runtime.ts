import { getTelegramWebApp } from "./telegram";

export type RuntimeTarget = "telegram" | "web";

const WEB_GUEST_KEY = "qahal_web_guest_id";

export const detectRuntimeTarget = (): RuntimeTarget => {
  return getTelegramWebApp() ? "telegram" : "web";
};

export const getWebGuestId = (): number => {
  const existing = window.localStorage.getItem(WEB_GUEST_KEY);
  if (existing) {
    const parsed = Number(existing);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  const generated = Math.floor(Math.random() * 1_000_000_000) + 1;
  window.localStorage.setItem(WEB_GUEST_KEY, String(generated));
  return generated;
};

export const clearWebGuestId = (): void => {
  window.localStorage.removeItem(WEB_GUEST_KEY);
};