export const SHOP_NAME =
  process.env.NEXT_PUBLIC_SHOP_NAME?.trim() || "ECO BRIGHT LED & SOLAR";
export const SHOP_TAGLINE = "LED & solar that lasts";
export const SHOP_DESCRIPTION =
  "Premium LED lighting and solar products with mobile-first browsing, local cart + invoice generation, QR handoff, and direct Telegram ordering.";
const DEFAULT_TELEGRAM_PUBLIC_URL = "https://t.me/eco_bright_sale_bot";
const DEFAULT_TELEGRAM_OWNER_URL = "+85512710410";

function normalizeTelegramBaseUrl(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return DEFAULT_TELEGRAM_PUBLIC_URL;
  }

  if (normalized.startsWith("https://") || normalized.startsWith("http://")) {
    return normalized;
  }

  if (normalized.startsWith("@")) {
    return `https://t.me/${normalized.slice(1)}`;
  }

  if (/^\+\d{6,20}$/.test(normalized)) {
    return `https://t.me/${normalized}`;
  }

  return `https://t.me/${normalized.replace(/^@/, "")}`;
}

export const TELEGRAM_PUBLIC_URL = normalizeTelegramBaseUrl(
  process.env.NEXT_PUBLIC_TELEGRAM_URL?.trim() ||
    process.env.NEXT_PUBLIC_ORDER_TELEGRAM_URL?.trim() ||
    DEFAULT_TELEGRAM_PUBLIC_URL,
);

// Owner/support contact link (not necessarily the ordering bot).
export const TELEGRAM_OWNER_URL = normalizeTelegramBaseUrl(
  process.env.NEXT_PUBLIC_TELEGRAM_OWNER_URL?.trim() ||
    DEFAULT_TELEGRAM_OWNER_URL ||
    TELEGRAM_PUBLIC_URL,
);
export const TELEGRAM_CHECKOUT_URL = normalizeTelegramBaseUrl(
  process.env.NEXT_PUBLIC_TELEGRAM_CHECKOUT_URL?.trim() || TELEGRAM_PUBLIC_URL,
);
export const CURRENCY =
  process.env.NEXT_PUBLIC_DEFAULT_CURRENCY === "USD" ? "USD" : "USD";

export const MARQUEE_ITEMS = [
  "Quality LED Bulbs",
  "LED Tubes",
  "Solar Flood Lights",
  "Street Lights",
  "Solar Panels",
  "Batteries",
  "Accessories",
] as const;

export const STORAGE_KEYS = {
  cart: "eco-bright.cart.v1",
  checkoutForm: "eco-bright.checkout-form.v1",
} as const;
