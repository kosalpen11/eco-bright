"use client";

import {
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  getHtmlLang,
  LOCALE_ATTRIBUTE,
  LOCALE_COOKIE_KEY,
  LOCALE_STORAGE_KEY,
  resolveLocale,
  type Locale,
} from "@/lib/locale";

type Listener = () => void;

const listeners = new Set<Listener>();
let currentLocale: Locale = DEFAULT_LOCALE;
let initialized = false;

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function applyLocaleToDocument(locale: Locale) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.setAttribute(LOCALE_ATTRIBUTE, locale);
  root.lang = getHtmlLang(locale);
}

function readStoredLocale() {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  try {
    return resolveLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

function writeStoredLocale(locale: Locale) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Keep the in-memory locale even if persistence fails.
  }
}

function persistLocaleCookie(locale: Locale) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Best-effort: keep server-rendered locale in sync across navigations.
    void fetch("/api/locale", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale }),
    });
  } catch {
    // Ignore network issues; localStorage + in-memory locale still work.
  }
}

function getDocumentLocale() {
  if (typeof document === "undefined") {
    return DEFAULT_LOCALE;
  }

  return resolveLocale(document.documentElement.getAttribute(LOCALE_ATTRIBUTE));
}

function setLocale(locale: Locale) {
  currentLocale = locale;
  applyLocaleToDocument(locale);
  writeStoredLocale(locale);
  persistLocaleCookie(locale);
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
    currentLocale = getDocumentLocale();
  }

  return currentLocale;
}

function getServerSnapshot() {
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!initialized) {
      initialized = true;
      const nextLocale = resolveLocale(
        document.documentElement.getAttribute(LOCALE_ATTRIBUTE) ?? readStoredLocale(),
      );
      setLocale(nextLocale);
      return;
    }

    applyLocaleToDocument(currentLocale);
  }, []);

  return <>{children}</>;
}

export function useLocale() {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    locale,
    setLocale,
    toggleLocale: () => setLocale(locale === "km" ? "en" : "km"),
  };
}
