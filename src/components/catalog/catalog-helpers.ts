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
