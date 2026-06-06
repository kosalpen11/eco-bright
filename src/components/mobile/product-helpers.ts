import type { Product } from "@/lib/types";

/**
 * Get the product image URL, supporting both camelCase and snake_case.
 * Returns null if image_url and imageUrl are both missing/empty.
 */
export function getProductImage(
  product: Product & { image_url?: string | null; imageUrl?: string | null },
): string | null {
  const url =
    product.imageUrl || (product as unknown as Record<string, unknown>).image_url;
  return typeof url === "string" && url.trim() ? url : null;
}

/**
 * Get the product title, supporting both camelCase and snake_case.
 */
export function getProductTitle(
  product: Product & { title?: string; name?: string },
): string {
  return product.name || product.title || "Unnamed Product";
}

/**
 * Get the product category label, supporting both camelCase and snake_case.
 */
export function getProductCategoryLabel(
  product: Product & { categoryLabel?: string; category_label?: string },
): string {
  const label =
    product.categoryLabel || (product as unknown as Record<string, unknown>).category_label;
  return typeof label === "string" && label.trim() ? label : "Uncategorized";
}

/**
 * Get the product price as a number.
 * Supports both number and string (will parse string).
 */
export function getProductPrice(
  product: Product & { price?: number | string },
): number {
  const price = product.price ?? 0;
  return typeof price === "string" ? Number(price) || 0 : price;
}

/**
 * Get the product old price as a number or null.
 * Supports both camelCase and snake_case, and both number and string.
 */
export function getProductOldPrice(
  product: Product & { oldPrice?: number | string | null; old_price?: number | string | null },
): number | null {
  let oldPrice = product.oldPrice ?? (product as unknown as Record<string, unknown>).old_price;
  
  if (oldPrice === null || oldPrice === undefined || oldPrice === "") return null;
  
  if (typeof oldPrice === "string") {
    const num = Number(oldPrice);
    return Number.isFinite(num) ? num : null;
  }
  
  if (typeof oldPrice === "number") {
    return Number.isFinite(oldPrice) ? oldPrice : null;
  }
  
  return null;
}

/**
 * Check if product is active for public display.
 * Supports both camelCase and snake_case.
 */
export function isProductActive(
  product: Product & { isActive?: boolean; is_active?: boolean },
): boolean {
  const active =
    product.isActive ?? (product as unknown as Record<string, unknown>).is_active;
  return active === true; // explicitly check === true to be safe
}

/**
 * Get product currency, with fallback to USD.
 */
export function getProductCurrency(
  product: Product & { currency?: string },
): string {
  return (product.currency && product.currency.trim()) || "USD";
}

/**
 * Get product badge if exists.
 */
export function getProductBadge(product: Product): string | null {
  return (product.badge && product.badge.trim()) || null;
}

/**
 * Get product rating if valid.
 */
export function getProductRating(product: Product): number | null {
  const rating = product.rating;
  if (typeof rating === "number" && Number.isFinite(rating) && rating > 0) {
    return rating;
  }
  return null;
}
