"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useLocale } from "@/components/locale/locale-provider";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/theme-provider";
import { getUiText } from "@/lib/i18n";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { locale } = useLocale();
  const copy = getUiText(locale).theme;
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="surface"
      size="sm"
      onClick={toggleTheme}
      aria-label={copy.switchTo(isDark ? "light" : "dark")}
      className="min-w-0 gap-2 px-3"
    >
      {isDark ? <MoonStar className="size-4" /> : <SunMedium className="size-4" />}
      <span className="hidden sm:inline">{isDark ? copy.dark : copy.light}</span>
    </Button>
  );
}
