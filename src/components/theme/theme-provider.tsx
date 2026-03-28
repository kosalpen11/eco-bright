"use client";

import {
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_THEME,
  resolveTheme,
  THEME_ATTRIBUTE,
  THEME_CLASS_DARK,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";

type Listener = () => void;

const listeners = new Set<Listener>();
let currentTheme: Theme = DEFAULT_THEME;
let initialized = false;

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function applyThemeToDocument(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.setAttribute(THEME_ATTRIBUTE, theme);
  root.classList.toggle(THEME_CLASS_DARK, theme === "dark");
}

function readStoredTheme() {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  try {
    return resolveTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
}

function getDocumentTheme() {
  if (typeof document === "undefined") {
    return DEFAULT_THEME;
  }

  return resolveTheme(document.documentElement.getAttribute(THEME_ATTRIBUTE));
}

function writeStoredTheme(theme: Theme) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures and keep the current session theme.
  }
}

function setTheme(theme: Theme) {
  currentTheme = theme;
  applyThemeToDocument(theme);
  writeStoredTheme(theme);
  notify();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  if (typeof window !== "undefined") {
    currentTheme = getDocumentTheme();
  }

  return currentTheme;
}

function getServerSnapshot() {
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!initialized) {
      initialized = true;
      const nextTheme = resolveTheme(
        document.documentElement.getAttribute(THEME_ATTRIBUTE) ?? readStoredTheme(),
      );
      setTheme(nextTheme);
      return;
    }

    applyThemeToDocument(currentTheme);
  }, []);

  return <>{children}</>;
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    theme,
    setTheme,
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
}
