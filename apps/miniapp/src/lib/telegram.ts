declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        colorScheme?: "light" | "dark";
        initData?: string;
        initDataUnsafe?: Record<string, unknown>;
        onEvent?: (eventName: string, cb: () => void) => void;
        offEvent?: (eventName: string, cb: () => void) => void;
      };
    };
  }
}

export type TelegramColorScheme = "light" | "dark";

export const getTelegramWebApp = () => window.Telegram?.WebApp;

export const getTelegramColorScheme = (): TelegramColorScheme | null => {
  const colorScheme = getTelegramWebApp()?.colorScheme;
  return colorScheme === "light" || colorScheme === "dark" ? colorScheme : null;
};

export const bootstrapTelegram = () => {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    return;
  }

  webApp.ready();
  webApp.expand();
};

export const subscribeThemeChanged = (
  callback: (colorScheme: TelegramColorScheme | null) => void,
) => {
  const webApp = getTelegramWebApp();
  if (!webApp?.onEvent || !webApp?.offEvent) {
    return () => {};
  }

  const onThemeChanged = () => {
    callback(getTelegramColorScheme());
  };

  webApp.onEvent("themeChanged", onThemeChanged);
  return () => webApp.offEvent?.("themeChanged", onThemeChanged);
};
