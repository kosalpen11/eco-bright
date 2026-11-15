/**
 * Catalog URL shapes (client-safe, no server imports).
 *
 * - /products                     all products (the storefront home)
 * - /category/{slug}              one category; the only indexable filtered listing
 * - any of the above + ?q=&brand=&min=&max=&sort=&page=   filters (noindex,follow)
 *
 * Every filter control builds its URL with `buildCatalogHref`, so `category` never
 * appears as a query parameter in links the site produces.
 */

export const CATEGORY_PATH_PREFIX = "/category/";
export const LISTING_PATH = "/products";

export function categoryPath(slug: string) {
  return `${CATEGORY_PATH_PREFIX}${encodeURIComponent(slug)}`;
}

/** True on /products, /category/{slug} and the legacy /catalog/{brand} routes. */
export function isCatalogPath(pathname: string) {
  return (
    pathname === LISTING_PATH ||
    pathname.startsWith(CATEGORY_PATH_PREFIX) ||
    pathname.startsWith("/catalog/")
  );
}

/** Category slug from a /category/{slug} pathname, or null. */
export function categoryFromPathname(pathname: string): string | null {
  if (!pathname.startsWith(CATEGORY_PATH_PREFIX)) return null;
  const raw = pathname.slice(CATEGORY_PATH_PREFIX.length).split("/")[0] ?? "";
  try {
    return decodeURIComponent(raw) || null;
  } catch {
    return null;
  }
}

/**
 * Current catalog state as one URLSearchParams, with the category from the path folded in.
 * On non-catalog pages (e.g. a product page) only the category is kept by callers that set it.
 */
export function getCatalogParams(pathname: string, searchParams: { toString(): string }) {
  const params = new URLSearchParams(isCatalogPath(pathname) ? searchParams.toString() : "");
  const pathCategory = categoryFromPathname(pathname);
  if (pathCategory && !params.has("category")) params.set("category", pathCategory);
  return params;
}

/** Builds /category/{slug}?… when a category is set, else /products?… . Empty values are dropped. */
export function buildCatalogHref(
  input: URLSearchParams | Record<string, string | number | null | undefined>,
) {
  const params = new URLSearchParams();
  const entries = input instanceof URLSearchParams ? [...input.entries()] : Object.entries(input);
  for (const [key, value] of entries) {
    if (value === null || value === undefined || value === "") continue;
    params.set(key, String(value));
  }

  const category = params.get("category");
  params.delete("category");
  const base = category && category !== "all" ? categoryPath(category) : LISTING_PATH;
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
