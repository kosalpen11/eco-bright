import { buildTelegramProfileUrl } from "@/lib/checkout";
import { TELEGRAM_CHECKOUT_USERNAME } from "@/lib/constants";
import { SITE_URL } from "@/lib/seo";

export function formatUsd(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

/** "$8.75" or "$8.75 – $65" when the options span a range. */
export function formatPriceRange(min: number, max: number, currency = "USD") {
  return max > min ? `${formatUsd(min, currency)} – ${formatUsd(max, currency)}` : formatUsd(min, currency);
}

export function productUrl(slug: string) {
  return `${SITE_URL}/products/${encodeURIComponent(slug)}`;
}

/** t.me link to the sales account with a prefilled Khmer order message. */
export function buildProductOrderHref(input: {
  name: string;
  code: string;
  priceText: string;
  slug: string;
}) {
  const message = [
    "សួស្តី! ខ្ញុំចង់បញ្ជាទិញ:",
    `- ផលិតផល: ${input.name}`,
    `- លេខកូដ: ${input.code}`,
    `- តម្លៃ: ${input.priceText}`,
    `- តំណ: ${productUrl(input.slug)}`,
    "",
    "តើនៅមានស្តុកទេ?",
  ].join("\n");

  return buildTelegramProfileUrl(TELEGRAM_CHECKOUT_USERNAME, message);
}
