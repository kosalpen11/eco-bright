"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale/locale-provider";
import type { Locale } from "@/lib/locale";

const localeOptions = [
  { value: "km", label: "ខ្មែរ" },
  { value: "en", label: "EN" },
] as const satisfies ReadonlyArray<{ value: Locale; label: string }>;

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-app-border bg-app-surface-2 p-1"
      role="group"
      aria-label="Language"
    >
      {localeOptions.map((option) => {
        const active = locale === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLocale(option.value)}
            className={cn(
              "locale-chip rounded-full px-3.5 py-2 text-sm font-semibold tracking-[0.12em] transition",
              active
                ? "bg-app-primary text-app-qr-text"
                : "text-app-text-muted hover:bg-app-surface-3 hover:text-app-text",
            )}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
