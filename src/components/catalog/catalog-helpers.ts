import type {
  ProductAttributeValue,
} from "@/lib/types";
import {
  getDisplayProductImage,
  type PublicProduct,
  type PublicProductVariant,
} from "@/lib/public-products";

export function isAllowedImageUrl(url: string) {
  if (url.startsWith("/")) return true;
  if (!url.startsWith("http")) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function optimizeImageUrl(url: string, width: number) {
  if (!isAllowedImageUrl(url) || !url.startsWith("http")) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const looksLikeR2 =
      hostname.includes("r2.dev") ||
      hostname.includes("cloudflarestorage.com") ||
      hostname.includes("cf-ipfs.com");

    if (looksLikeR2) {
      if (!parsed.searchParams.has("width")) parsed.searchParams.set("width", String(width));
      if (!parsed.searchParams.has("quality")) parsed.searchParams.set("quality", "75");
      if (!parsed.searchParams.has("fit")) parsed.searchParams.set("fit", "cover");
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

export function getProductImages(product: Pick<PublicProduct, "imageUrl" | "imageUrls">) {
  const rawImages = product.imageUrls?.length
    ? product.imageUrls
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  return rawImages.filter((url) => typeof url === "string" && isAllowedImageUrl(url));
}

export function getEffectiveVariant(
  product: Pick<PublicProduct, "variants">,
  variantId?: string | null,
) {
  if (!product.variants.length) return null;

  if (variantId) {
    const matched = product.variants.find((variant) => variant.id === variantId);
    if (matched) return matched;
  }

  return product.variants.find((variant) => variant.available) ?? product.variants[0] ?? null;
}

export function getEffectiveOldPrice(
  product: Pick<PublicProduct, "oldPrice">,
  variant?: Pick<PublicProductVariant, "oldPrice"> | null,
) {
  return variant?.oldPrice ?? product.oldPrice;
}

export interface ProductDiscount {
  price: number;
  oldPrice: number;
  /** Whole percent off, e.g. 50 for $29 → $14.50. */
  percent: number;
}

/**
 * The discount shown on a card: the old price of the option that sets the "from" price
 * (product.price), falling back to the product's old price. Null when nothing is on sale.
 */
export function getProductDiscount(
  product: Pick<PublicProduct, "price" | "oldPrice" | "variants">,
): ProductDiscount | null {
  const pricedVariants = product.variants.filter((variant) => typeof variant.price === "number");
  const pairs = pricedVariants.length
    ? pricedVariants
        .filter((variant) => variant.price === product.price)
        .map((variant) => ({ price: product.price, oldPrice: variant.oldPrice ?? product.oldPrice }))
    : [{ price: product.price, oldPrice: product.oldPrice }];

  const best = pairs
    .filter((pair): pair is { price: number; oldPrice: number } => typeof pair.oldPrice === "number" && pair.oldPrice > pair.price)
    .sort((a, b) => b.oldPrice - a.oldPrice)[0];
  if (!best || best.price <= 0) return null;

  const percent = Math.round((1 - best.price / best.oldPrice) * 100);
  return percent > 0 ? { ...best, percent } : null;
}

export function getEffectiveImage(
  product: Pick<PublicProduct, "imageUrl" | "imageUrls">,
  variant?: Pick<PublicProductVariant, "imageUrl"> | null,
) {
  const variantImage = variant?.imageUrl;
  if (variantImage && isAllowedImageUrl(variantImage)) {
    return variantImage;
  }

  return getDisplayProductImage(product, []);
}

export function getRatingLabel(rating: number | null) {
  if (typeof rating !== "number" || !Number.isFinite(rating) || rating <= 0) {
    return null;
  }

  return rating.toFixed(1);
}

export function formatAttributeValue(value: ProductAttributeValue) {
  if (Array.isArray(value)) {
    return value.join(" • ");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

export function getAttributeEntries(attributes: PublicProduct["attributes"]) {
  return Object.entries(attributes).filter(([, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== "" && value !== null && value !== undefined;
  });
}

export function getVariantAttributeEntries(attributes: PublicProductVariant["attributes"]) {
  return Object.entries(attributes).filter(([, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== "" && value !== null && value !== undefined;
  });
}
