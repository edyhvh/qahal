import "leaflet/dist/leaflet.css";
import "@telegram-apps/telegram-ui/dist/styles.css";
import "./styles/index.css";

import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import {
  bootstrapTelegram,
  getTelegramColorScheme,
  subscribeThemeChanged,
} from "./lib/telegram";
import {
  readStoredThemeMode,
  writeStoredThemeMode,
  type ThemeMode,
} from "./app/theme";

const resolveInitialThemeMode = (): ThemeMode => {
  const stored = readStoredThemeMode();
  if (stored) {
    return stored;
  }

  return getTelegramColorScheme() ?? "light";
};

function Bootstrap() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() =>
    resolveInitialThemeMode(),
  );

  useEffect(() => {
    bootstrapTelegram();
    return subscribeThemeChanged((colorScheme) => {
      if (!colorScheme) {
        return;
      }

      setThemeMode(colorScheme);
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme-mode", themeMode);
    writeStoredThemeMode(themeMode);
  }, [themeMode]);

  return <App themeMode={themeMode} onThemeChange={setThemeMode} />;
}

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <Bootstrap />
  </StrictMode>
);
