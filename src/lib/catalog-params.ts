import type { ProductSortMode } from "@/lib/types";

export type CatalogSearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
type RawSearchParams = Awaited<CatalogSearchParams>;

const SORT_MODES = ["default", "price-asc", "price-desc", "name-asc"] as const satisfies ReadonlyArray<ProductSortMode>;

/** Category slugs before the Nov 2026 cleanup → current slugs (old links keep working). */
export const LEGACY_CATEGORY_SLUGS: Record<string, string> = {
  "lighting-accessary": "lights",
  fan: "fans",
  "cable-accessory": "cables",
  "solar-lighting": "solar",
};

function firstValue(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function parsePositiveNumber(value: string | null): number | null {
  if (!value?.trim()) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function parseSort(value: string | null): ProductSortMode | null {
  if (!value) return null;
  return (SORT_MODES as readonly string[]).includes(value) ? (value as ProductSortMode) : null;
}

/**
 * Reads listing filters for /products and /category/{slug}. The category comes from the path;
 * a ?category= parameter (old links, the no-JS price form) is accepted but triggers a redirect.
 */
export function parseCatalogSearchParams(
  sp: RawSearchParams,
  { routeCategory, legacyBrand }: { routeCategory?: string | null; legacyBrand?: string | null } = {},
) {
  const rawCategory = (firstValue(sp.category) ?? routeCategory ?? "").trim();
  const category = rawCategory && rawCategory !== "all" ? rawCategory : null;
  const brand = (firstValue(sp.brand) ?? legacyBrand ?? "").trim() || null;
  const q = (firstValue(sp.q) ?? "").trim() || null;
  const sort = parseSort(firstValue(sp.sort)) ?? "default";
  const pageRaw = Number(firstValue(sp.page));
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;
  const minPrice = parsePositiveNumber(firstValue(sp.min) ?? firstValue(sp.minPrice));
  const maxPrice = parsePositiveNumber(firstValue(sp.max) ?? firstValue(sp.maxPrice));

  const canonicalParams = {
    q,
    category: category ? (LEGACY_CATEGORY_SLUGS[category] ?? category) : null,
    brand,
    min: minPrice,
    max: maxPrice,
    sort: sort === "default" ? null : sort,
    page: page > 1 ? page : null,
  };

  const needsRedirect =
    Boolean(legacyBrand) ||
    sp.category !== undefined ||
    sp.minPrice !== undefined ||
    sp.maxPrice !== undefined ||
    routeCategory === "all" ||
    (category !== null && category in LEGACY_CATEGORY_SLUGS);

  /** Search, brand, price or sort applied: noindex,follow and canonical to the unfiltered listing. */
  const hasFilters = Boolean(q || brand || minPrice !== null || maxPrice !== null || sort !== "default");

  return {
    category,
    brand,
    q,
    sort,
    page,
    minPrice,
    maxPrice,
    canonicalParams,
    needsRedirect,
    hasFilters,
    /** Only the plain first page of /products or /category/{slug} is indexable. */
    isIndexable: !hasFilters && page === 1,
  };
}
