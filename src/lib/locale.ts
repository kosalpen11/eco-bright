export type Locale = "km" | "en";

export const DEFAULT_LOCALE: Locale = "km";
export const LOCALE_STORAGE_KEY = "eco-bright.locale.v1";
export const LOCALE_ATTRIBUTE = "data-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "km" || value === "en";
}

export function resolveLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getHtmlLang(locale: Locale) {
  return locale === "km" ? "km" : "en";
}
