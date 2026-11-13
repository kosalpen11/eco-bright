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
  "អំពូល LED កង្ហារប្រើថ្ម ខ្សែភ្លើង ផលិតផលសូឡា និងគ្រឿងបន្លាស់ ពី ECOBright។ មើលតម្លៃ ជ្រើសរើសតាមប្រភេទ ហើយបញ្ជាទិញផ្ទាល់តាម Telegram។ ដឹកជញ្ជូនក្នុងភ្នំពេញ។";

/** Listing page (/products) description. */
export const CATALOG_DESCRIPTION_KM =
  "ទំនិញទាំងអស់របស់ ECOBright៖ អំពូល LED កង្ហារប្រើថ្ម ខ្សែភ្លើង ផលិតផលសូឡា និងគ្រឿងបន្លាស់ ម៉ាក Grace, Fuji, Fixer និង One។ ច្រោះតាមប្រភេទ ម៉ាក និងតម្លៃ ហើយបញ្ជាទិញតាម Telegram។ ដឹកជញ្ជូនក្នុងភ្នំពេញ។";

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
