export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "eco-bright.theme.v1";
export const DEFAULT_THEME: Theme = "light";
export const THEME_ATTRIBUTE = "data-theme";
export const THEME_CLASS_DARK = "dark";

export function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}

export function resolveTheme(value: string | null | undefined): Theme {
  return isTheme(value) ? value : DEFAULT_THEME;
}
