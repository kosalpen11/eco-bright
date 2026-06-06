"use client";

import { useEffect, type ReactNode } from "react";
import { DEFAULT_THEME, THEME_ATTRIBUTE, type Theme } from "@/lib/theme";

function applyThemeToDocument(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.setAttribute(THEME_ATTRIBUTE, theme);
  root.classList.remove("dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyThemeToDocument(DEFAULT_THEME);
  }, []);

  return <>{children}</>;
}

export function useTheme() {
  return {
    theme: DEFAULT_THEME,
    setTheme: () => undefined,
    toggleTheme: () => undefined,
  };
}
