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

export const getTelegramWebApp = () => window.Telegram?.WebApp;

export const bootstrapTelegram = () => {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    return;
  }

  webApp.ready();
  webApp.expand();
};

export const subscribeThemeChanged = (callback: () => void) => {
  const webApp = getTelegramWebApp();
  if (!webApp?.onEvent || !webApp?.offEvent) {
    return () => {};
  }

  webApp.onEvent("themeChanged", callback);
  return () => webApp.offEvent?.("themeChanged", callback);
};
