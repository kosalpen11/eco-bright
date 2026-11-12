/** Shared constants and helpers for link-preview (Open Graph / Twitter) metadata. */

export const SITE_URL = "https://ecobright.store";
export const SITE_NAME = "ECOBright";
export const SITE_LOCALE = "km_KH";
export const SITE_ALTERNATE_LOCALE = "en_US";

export const DEFAULT_OG_IMAGE = {
  url: "/og-default.jpg",
  width: 1200,
  height: 630,
  alt: "ECOBright LED & Solar",
} as const;

export const SITE_DESCRIPTION_KM =
  "ECOBright ផ្គត់ផ្គង់អំពូល LED និងផលិតផលសូឡាគុណភាពខ្ពស់ នៅកម្ពុជា។ កុម្ម៉ង់ងាយៗតាម Telegram។";

export const PRODUCT_DESCRIPTION_FALLBACK_KM =
  "ផលិតផល LED និងសូឡាគុណភាពខ្ពស់ពី ECOBright។ កុម្ម៉ង់ឥឡូវនេះតាម Telegram។";

// Product records fall back to this when they have no image of their own.
const PRODUCT_PLACEHOLDER_IMAGE = "/ecobright-logo.jpeg";

/**
 * Returns an absolute https URL for a product image, or null when the product
 * has no real image (so callers can use DEFAULT_OG_IMAGE instead).
 * Relative paths resolve against SITE_URL; http URLs are upgraded to https
 * because Facebook and Telegram previews require/prefer secure images.
 */
export function toAbsoluteHttpsImageUrl(src: string | null | undefined): string | null {
  const value = src?.trim();
  if (!value || value === PRODUCT_PLACEHOLDER_IMAGE) return null;

  try {
    const url = new URL(value, SITE_URL);
    if (url.protocol === "http:") url.protocol = "https:";
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function formatUsdForTitle(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/** Collapses whitespace and trims to a preview-friendly length. */
export function toMetaDescription(text: string, maxLength = 200) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}
