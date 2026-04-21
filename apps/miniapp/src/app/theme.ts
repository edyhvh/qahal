export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "qahal-theme-mode";

export const isThemeMode = (value: string | null): value is ThemeMode => {
  return value === "light" || value === "dark";
};

export const getNextThemeMode = (mode: ThemeMode): ThemeMode => {
  return mode === "light" ? "dark" : "light";
};

export const readStoredThemeMode = (): ThemeMode | null => {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(raw) ? raw : null;
  } catch {
    return null;
  }
};

export const writeStoredThemeMode = (mode: ThemeMode) => {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Ignore localStorage failures in restricted environments.
  }
};
