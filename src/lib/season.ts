/**
 * Seasonal storefront decoration. Purely visual: it never changes prices, flow or copy outside the
 * holiday banner. The active season is set on <html data-season="…"> by the root layout, and
 * globals.css scopes all festive styles to that attribute.
 */
export type Season = "water-festival" | "christmas";

export const SEASON_ATTRIBUTE = "data-season";

/** "YYYY-MM-DD" ranges (inclusive), evaluated in Cambodia time. First match wins. */
type SeasonWindow = { season: Season; start: string; end: string };

/**
 * Bon Om Touk follows the lunar calendar (full moon of Kadeuk), so its dates change every year.
 * Add each year's window from the official public-holiday list; a missing year simply shows nothing.
 * 2026 holiday: 23–25 Nov (decoration starts a week early).
 */
const WATER_FESTIVAL_WINDOWS: SeasonWindow[] = [
  { season: "water-festival", start: "2026-11-16", end: "2026-11-25" },
];

/** Christmas & New Year: 1 Dec through 7 Jan, every year. */
function christmasWindow(year: number): SeasonWindow[] {
  return [
    { season: "christmas", start: `${year - 1}-12-01`, end: `${year}-01-07` },
    { season: "christmas", start: `${year}-12-01`, end: `${year + 1}-01-07` },
  ];
}

const STORE_TIME_ZONE = "Asia/Phnom_Penh";

/** Today's date in Cambodia as "YYYY-MM-DD" (sortable as a string). */
function storeDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getActiveSeason(date: Date = new Date()): Season | null {
  const today = storeDate(date);
  const year = Number(today.slice(0, 4));
  const windows = [...WATER_FESTIVAL_WINDOWS, ...christmasWindow(year)];
  return windows.find((window) => today >= window.start && today <= window.end)?.season ?? null;
}
