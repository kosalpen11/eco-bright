import "server-only";

import { unstable_cache } from "next/cache";

import { getBrands, getCategories, getProductById, getProducts } from "@/lib/db/products";

/**
 * Short-lived cache for storefront page reads, so pages don't wait on a database
 * round trip for every visitor. Catalog edits show up within REVALIDATE_SECONDS,
 * or immediately after `revalidateTag(PRODUCTS_CACHE_TAG)`.
 *
 * Only for rendering pages: order creation and admin flows must keep using the
 * uncached queries in `@/lib/db/products` so prices are always fresh.
 */
export const PRODUCTS_CACHE_TAG = "products";
const REVALIDATE_SECONDS = 60;
const options = { revalidate: REVALIDATE_SECONDS, tags: [PRODUCTS_CACHE_TAG] };

export const getCachedProducts = unstable_cache(getProducts, ["storefront-products"], options);
export const getCachedProductById = unstable_cache(getProductById, ["storefront-product"], options);
export const getCachedCategories = unstable_cache(getCategories, ["storefront-categories"], options);
export const getCachedBrands = unstable_cache(getBrands, ["storefront-brands"], options);
