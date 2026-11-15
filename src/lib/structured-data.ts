/**
 * One source for every SEO value derived from a product: page metadata, JSON-LD and the
 * Google Merchant feed all call these helpers, so title, price and availability always match.
 * Pure functions (no server or client imports), unit-tested in src/lib/catalog/structured-data.test.ts.
 */
import { TELEGRAM_OWNER_URL } from "@/lib/constants";
import { categoryPath } from "@/lib/catalog-url";
import type { PublicProduct } from "@/lib/public-products";
import {
  DELIVERY_LINE_KM,
  SITE_ALTERNATE_NAME,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  toAbsoluteHttpsImageUrl,
  toMetaDescription,
} from "@/lib/seo";

type JsonLd = Record<string, unknown>;

export type SeoProduct = Pick<
  PublicProduct,
  | "id"
  | "slug"
  | "brand"
  | "name"
  | "title"
  | "category"
  | "categoryLabel"
  | "categoryLabelKm"
  | "description"
  | "descriptionKm"
  | "price"
  | "priceMax"
  | "currency"
  | "available"
  | "imageUrl"
  | "imageUrls"
  | "variants"
>;

/** Own descriptions shorter than this are padded with name, category and delivery facts. */
const THIN_DESCRIPTION_CHARS = 60;

export function productPath(product: Pick<SeoProduct, "slug">) {
  return `/products/${encodeURIComponent(product.slug)}`;
}

export function productUrl(product: Pick<SeoProduct, "slug">) {
  return absoluteUrl(productPath(product));
}

export function productName(product: Pick<SeoProduct, "name" | "title">) {
  return product.name.trim() || product.title.trim();
}

export function productCategoryName(product: Pick<SeoProduct, "categoryLabel" | "categoryLabelKm">) {
  return product.categoryLabelKm?.trim() || product.categoryLabel;
}

/** The product's own description text (Khmer first), or "" when it has none. */
export function ownProductDescription(product: Pick<SeoProduct, "description" | "descriptionKm">) {
  return product.descriptionKm?.trim() || product.description?.trim() || "";
}

function joinKhmerSentences(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => part?.trim().replace(/[។.]+$/u, ""))
    .filter((part): part is string => Boolean(part))
    .join("។ ")
    .concat("។");
}

/**
 * Meta / JSON-LD / feed description. Uses the product's own text when it is substantial;
 * otherwise builds a Khmer sentence from real data only (name, own text, category, brand).
 */
export function buildProductDescription(product: SeoProduct) {
  const own = ownProductDescription(product);
  if (own.length >= THIN_DESCRIPTION_CHARS) return toMetaDescription(own, 300);

  const name = productName(product);
  return toMetaDescription(
    joinKhmerSentences([
      name,
      own && own !== name ? own : null,
      `ប្រភេទ៖ ${productCategoryName(product)}`,
      product.brand ? `ម៉ាក ${product.brand}` : null,
      "បញ្ជាទិញតាម Telegram",
      DELIVERY_LINE_KM,
    ]),
    300,
  );
}

/** Real product photos as absolute https URLs (placeholder logo excluded), de-duplicated. */
export function productImageUrls(product: Pick<SeoProduct, "imageUrl" | "imageUrls">) {
  const urls = [...product.imageUrls, product.imageUrl]
    .map((src) => toAbsoluteHttpsImageUrl(src))
    .filter((src): src is string => Boolean(src));
  return [...new Set(urls)];
}

export function formatPriceValue(price: number) {
  return price.toFixed(2);
}

export interface ProductOfferSummary {
  currency: string;
  /** Lowest price ("from" price) — what listings, the title and the feed show. */
  lowPrice: number;
  highPrice: number;
  isRange: boolean;
  /** Priced options, or 1 for a product without options. */
  offerCount: number;
  available: boolean;
}

export function getProductOffer(product: SeoProduct): ProductOfferSummary {
  const priced = product.variants.filter((variant) => typeof variant.price === "number");
  return {
    currency: product.currency?.trim() || "USD",
    lowPrice: product.price,
    highPrice: product.priceMax,
    isRange: product.priceMax > product.price,
    offerCount: Math.max(1, priced.length),
    available: product.available,
  };
}

const SCHEMA_IN_STOCK = "https://schema.org/InStock";
const SCHEMA_OUT_OF_STOCK = "https://schema.org/OutOfStock";
const SCHEMA_NEW = "https://schema.org/NewCondition";

export function productJsonLd(product: SeoProduct): JsonLd {
  const url = productUrl(product);
  const offer = getProductOffer(product);
  const images = productImageUrls(product);
  const availability = offer.available ? SCHEMA_IN_STOCK : SCHEMA_OUT_OF_STOCK;

  const offers: JsonLd = offer.isRange
    ? {
        "@type": "AggregateOffer",
        url,
        priceCurrency: offer.currency,
        lowPrice: formatPriceValue(offer.lowPrice),
        highPrice: formatPriceValue(offer.highPrice),
        offerCount: offer.offerCount,
        availability,
        itemCondition: SCHEMA_NEW,
      }
    : {
        "@type": "Offer",
        url,
        priceCurrency: offer.currency,
        price: formatPriceValue(offer.lowPrice),
        availability,
        itemCondition: SCHEMA_NEW,
      };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: productName(product),
    url,
    ...(images.length ? { image: images } : {}),
    description: buildProductDescription(product),
    sku: product.id,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    category: productCategoryName(product),
    offers,
  };
}

export interface BreadcrumbEntry {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbEntry[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export const HOME_BREADCRUMB_KM: BreadcrumbEntry = { name: "ទំព័រដើម", path: "/products" };

export function productBreadcrumbs(product: SeoProduct): BreadcrumbEntry[] {
  return [
    HOME_BREADCRUMB_KM,
    { name: productCategoryName(product), path: categoryPath(product.category) },
    { name: productName(product), path: productPath(product) },
  ];
}

/** Summary-page ItemList (name + url + position) for a listing or a home row. */
export function itemListJsonLd(
  name: string,
  products: Array<Pick<SeoProduct, "slug" | "name" | "title">>,
  startPosition = 1,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: startPosition + index,
      url: productUrl(product),
      name: productName(product),
    })),
  };
}

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(SITE_LOGO_PATH),
      width: 640,
      height: 640,
    },
    sameAs: [TELEGRAM_OWNER_URL],
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAME,
    url: SITE_URL,
    inLanguage: "km",
    publisher: { "@id": ORGANIZATION_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/products?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

// ---------------------------------------------------------------------------
// Google Merchant Center feed
// ---------------------------------------------------------------------------

export interface MerchantFeedItem {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImageLinks: string[];
  availability: "in_stock" | "out_of_stock";
  /** e.g. "14.00 USD" — the same number as the JSON-LD price / lowPrice. */
  price: string;
  brand: string | null;
  condition: "new";
  productType: string;
  identifierExists: "no";
}

export type FeedSkipReason = "no-image" | "no-price" | "no-description";
export type FeedWarning = "no-brand" | "thin-description";

/** Why a product cannot go into the feed (empty = it can). */
export function getFeedSkipReasons(product: SeoProduct): FeedSkipReason[] {
  const reasons: FeedSkipReason[] = [];
  if (productImageUrls(product).length === 0) reasons.push("no-image");
  if (!(product.price > 0)) reasons.push("no-price");
  if (!ownProductDescription(product)) reasons.push("no-description");
  return reasons;
}

/** Data gaps worth fixing in admin that don't block the feed. */
export function getFeedWarnings(product: SeoProduct): FeedWarning[] {
  const warnings: FeedWarning[] = [];
  if (!product.brand) warnings.push("no-brand");
  if (ownProductDescription(product).length < THIN_DESCRIPTION_CHARS) warnings.push("thin-description");
  return warnings;
}

export function buildMerchantFeedItem(product: SeoProduct): MerchantFeedItem | null {
  if (getFeedSkipReasons(product).length > 0) return null;
  const offer = getProductOffer(product);
  const [imageLink, ...rest] = productImageUrls(product);

  return {
    id: product.id,
    title: productName(product).slice(0, 150),
    description: buildProductDescription(product),
    link: productUrl(product),
    imageLink: imageLink!,
    additionalImageLinks: rest.slice(0, 10),
    availability: offer.available ? "in_stock" : "out_of_stock",
    price: `${formatPriceValue(offer.lowPrice)} ${offer.currency}`,
    brand: product.brand,
    condition: "new",
    productType: `${SITE_NAME} > ${productCategoryName(product)}`,
    identifierExists: "no",
  };
}

/** Escapes a JSON-LD payload so it can't close the <script> tag. */
export function serializeJsonLd(data: JsonLd | JsonLd[]) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
