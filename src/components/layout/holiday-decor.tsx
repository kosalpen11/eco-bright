"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";
import type { Season } from "@/lib/season";

import { WaterFestivalScene } from "./water-festival-scene";

const BANNER_ICON: Record<Season, string> = {
  "water-festival": "🌕",
  christmas: "🎄",
};

/** Slim seasonal greeting above the site header. Only rendered while a season is active. */
export function HolidayBanner({ season }: { season: Season }) {
  const { locale } = useLocale();
  const copy = getUiText(locale).site.holiday;
  const message = season === "water-festival" ? copy.waterFestival : copy.christmas;

  return (
    <div className="holiday-banner hide-on-print">
      {season === "water-festival" ? <WaterFestivalScene /> : null}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center gap-x-3 gap-y-1 px-3 py-2 text-center text-xs font-medium leading-snug sm:text-sm">
        <span aria-hidden="true">{BANNER_ICON[season]}</span>
        <span className="min-w-0">{message}</span>
        <Link
          href="/products"
          className="hidden shrink-0 items-center gap-1 font-semibold underline-offset-4 hover:underline sm:inline-flex"
        >
          {copy.cta}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

// Fixed positions so server and client markup match (no Math.random during render).
const PARTICLES = [
  { left: 4, size: 10, duration: 14, delay: -2 },
  { left: 11, size: 7, duration: 18, delay: -9 },
  { left: 19, size: 12, duration: 16, delay: -5 },
  { left: 27, size: 8, duration: 20, delay: -14 },
  { left: 35, size: 11, duration: 15, delay: -1 },
  { left: 43, size: 7, duration: 19, delay: -11 },
  { left: 51, size: 9, duration: 17, delay: -6 },
  { left: 59, size: 12, duration: 21, delay: -16 },
  { left: 66, size: 8, duration: 14, delay: -3 },
  { left: 73, size: 10, duration: 18, delay: -12 },
  { left: 80, size: 7, duration: 16, delay: -8 },
  { left: 87, size: 11, duration: 20, delay: -4 },
  { left: 94, size: 9, duration: 15, delay: -10 },
];

/**
 * Decorative page particles: snowfall at Christmas, glowing floating lights (bandaet protip) rising
 * during the Water Festival. Pointer-transparent, hidden from screen readers and print.
 */
export function SeasonParticles({ season }: { season: Season }) {
  return (
    <div className={`season-particles season-particles--${season} hide-on-print`} aria-hidden="true">
      {PARTICLES.map((particle) => (
        <span
          key={particle.left}
          style={{
            left: `${particle.left}%`,
            fontSize: particle.size,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        >
          {season === "christmas" ? "❄" : null}
        </span>
      ))}
    </div>
  );
}
