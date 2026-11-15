import { permanentRedirect } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

import { BrandSelect } from "@/components/catalog/BrandSelect";
import { CatalogCartRail } from "@/components/catalog/CatalogCartRail";
import {
  CatalogLink,
  CatalogNavigationProvider,
  CatalogResults,
} from "@/components/catalog/catalog-navigation";
import { Pagination } from "@/components/catalog/Pagination";
import { PriceRangeFilter } from "@/components/catalog/PriceRangeFilter";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { RecommendedProducts } from "@/components/catalog/RecommendedProducts";
import { SearchInput } from "@/components/catalog/SearchInput";
import { SortSelect } from "@/components/catalog/SortSelect";
import { ProductGridSkeleton } from "@/components/common/page-skeletons";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { buildCatalogHref } from "@/lib/catalog-url";
import { parseCatalogSearchParams, type CatalogSearchParams } from "@/lib/catalog-params";
import { getCachedCatalogListing, getCachedRecommendedProducts } from "@/lib/db/cached-products";
import { getUiText, localizeText } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale-server";
import { getActiveProducts, mapProductToPublicProduct } from "@/lib/public-products";
import { getCategoryTitle } from "@/lib/seo";
import {
  HOME_BREADCRUMB_KM,
  breadcrumbJsonLd,
  itemListJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/structured-data";
import type { ProductFilters, ProductSortMode } from "@/lib/types";

const buildListingHref = buildCatalogHref;

type CatalogCopy = ReturnType<typeof getUiText>["catalogPage"];

function buildBrowseTitle(
  params: { brand?: string | null; category?: string | null; query?: string | null; total: number },
  copy: CatalogCopy,
) {
  if (params.query) {
    return { eyebrow: copy.searchResults, title: copy.resultsFor(params.query), subtitle: copy.matched(params.total) };
  }
  if (params.category) {
    return { eyebrow: copy.category, title: params.category, subtitle: copy.readyToBrowse(params.total) };
  }
  if (params.brand) {
    return { eyebrow: copy.brandCollection, title: params.brand, subtitle: copy.inBrand(params.total) };
  }
  return { eyebrow: copy.catalogEyebrow, title: copy.browseTitle, subtitle: copy.available(params.total) };
}

export async function CatalogPage({
  searchParams,
  brand: legacyBrandRoute,
  category: routeCategory,
}: {
  searchParams: CatalogSearchParams;
  /** Set by the legacy /catalog/[brand] route, which redirects to ?brand=. */
  brand?: string | null;
  /** Set by /category/[slug]; the category comes from the path, never from ?category=. */
  category?: string | null;
}) {
  const [locale, sp] = await Promise.all([getRequestLocale(), searchParams]);

  const parsed = parseCatalogSearchParams(sp, { routeCategory, legacyBrand: legacyBrandRoute });
  const { category, brand, q, sort, page, minPrice, maxPrice, canonicalParams } = parsed;

  // Old URL shapes (/catalog/grace, ?minPrice=, ?category=, old category slugs) → one canonical URL:
  // /category/{slug}?… for a category, /products?… otherwise.
  if (parsed.needsRedirect) {
    permanentRedirect(buildListingHref(canonicalParams));
  }

  const filters: ProductFilters = { brand, category, q, sort, page, minPrice, maxPrice };
  // The recommended row only shows on the plain first page (no search, filters or sort).
  const isUnfiltered =
    !q && !category && !brand && minPrice === null && maxPrice === null && sort === "default" && page === 1;
  const [listing, recommended] = await Promise.all([
    getCachedCatalogListing(filters),
    isUnfiltered ? getCachedRecommendedProducts(8).catch(() => []) : Promise.resolve([]),
  ]);

  const ui = getUiText(locale);
  const copy = ui.catalogPage;
  const publicProducts = getActiveProducts(listing.products).map(mapProductToPublicProduct);

  // Chips come from the same query as the list; empty categories never appear.
  const allCount = listing.categories.reduce((sum, item) => sum + item.count, 0);
  const categoryChips = [{ id: "all", label: "All", count: allCount }, ...listing.categories];
  const activeCategory = listing.categories.find((item) => item.id === category);
  const categoryLabel = activeCategory ? localizeText(locale, activeCategory.label, activeCategory.labelKm) : category;
  const brandLabel = listing.brands.find((item) => item.id.toLowerCase() === brand?.toLowerCase())?.label ?? brand;

  const sortLabels: Record<ProductSortMode, string> = {
    default: ui.catalog.sortDefault,
    "price-asc": ui.catalog.sortPriceAsc,
    "price-desc": ui.catalog.sortPriceDesc,
    "name-asc": ui.catalog.sortNameAsc,
  };
  const hero = buildBrowseTitle({ brand: brandLabel, category: categoryLabel, query: q, total: listing.total }, copy);
  const activeFilterChips = [
    q ? `${copy.chipSearch}: ${q}` : null,
    category ? `${copy.category}: ${categoryLabel}` : null,
    brand ? `${copy.chipBrand}: ${brandLabel}` : null,
    minPrice !== null ? `${copy.chipMin}: $${minPrice}` : null,
    maxPrice !== null ? `${copy.chipMax}: $${maxPrice}` : null,
    sort !== "default" ? `${copy.sort}: ${sortLabels[sort]}` : null,
  ].filter((label): label is string => Boolean(label));
  const hasActiveFilters = activeFilterChips.length > 0;

  // Structured data: ItemList for the visible products (and the recommended row on the home page),
  // Organization + WebSite on the plain home page, BreadcrumbList on category pages.
  const listName = activeCategory ? getCategoryTitle(activeCategory) : hero.title;
  const recommendedPublic = getActiveProducts(recommended).map(mapProductToPublicProduct);
  const structuredData: Array<Record<string, unknown>> = [];
  if (isUnfiltered) structuredData.push(organizationJsonLd(), websiteJsonLd());
  if (category && activeCategory) {
    structuredData.push(
      breadcrumbJsonLd([HOME_BREADCRUMB_KM, { name: getCategoryTitle(activeCategory), path: buildListingHref({ category }) }]),
    );
  }
  if (publicProducts.length) {
    structuredData.push(itemListJsonLd(listName, publicProducts, (listing.page - 1) * listing.pageSize + 1));
  }
  if (recommendedPublic.length) structuredData.push(itemListJsonLd(ui.productPage.recommended, recommendedPublic));

  return (
    <CatalogNavigationProvider>
    {structuredData.length ? <JsonLd data={structuredData} /> : null}
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      {/* The filter card below has the search box, so the header doesn't repeat it here. */}
      <SiteHeader categories={categoryChips} activeCategory={category ?? "all"} showSearch={false} />

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-3 py-4 sm:px-4 sm:py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-4">
          <section className="rounded-[1.6rem] border border-[var(--app-border)] bg-white p-4 shadow-[var(--app-shadow-surface)] sm:p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="locale-label flex items-center gap-2 text-xs font-semibold uppercase text-[var(--app-text-muted)]">
                    <SlidersHorizontal className="size-4" aria-hidden="true" />
                    {hero.eyebrow}
                  </div>
                  <h1 className="mt-1 text-xl font-bold text-[var(--app-text)] sm:text-2xl">{hero.title}</h1>
                  <p className="mt-2 text-sm text-[var(--app-text-muted)]">
                    {hero.subtitle} {copy.showingOnPage(publicProducts.length)}
                  </p>
                </div>

                {hasActiveFilters ? (
                  <CatalogLink
                    href="/products"
                    className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-sm font-semibold text-[var(--app-text-soft)] hover:border-[var(--app-border-strong)] hover:bg-[var(--app-surface-2)]"
                  >
                    <X className="size-4" aria-hidden="true" />
                    {ui.states.clearFilters}
                  </CatalogLink>
                ) : null}
              </div>

              {hasActiveFilters ? (
                <ul className="flex flex-wrap gap-2">
                  {activeFilterChips.map((label) => (
                    <li
                      key={label}
                      className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-xs font-medium text-[var(--app-text-soft)]"
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <div>
                  <div className="locale-label mb-2 text-xs font-medium uppercase text-[var(--app-text-muted)]">
                    {copy.searchProducts}
                  </div>
                  <SearchInput />
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <BrandSelect brands={listing.brands} activeBrand={brandLabel ?? null} />
                  <div className="min-w-0">
                    <div className="locale-label mb-2 text-xs font-medium uppercase text-[var(--app-text-muted)]">
                      {copy.sort}
                    </div>
                    <SortSelect />
                  </div>
                </div>
              </div>

              <PriceRangeFilter
                min={minPrice}
                max={maxPrice}
                preserved={{
                  q,
                  category: canonicalParams.category,
                  brand,
                  sort: canonicalParams.sort,
                }}
                clearHref={buildListingHref({ ...canonicalParams, min: null, max: null, page: null })}
                labels={{
                  price: ui.catalog.price,
                  min: ui.catalog.min,
                  max: ui.catalog.max,
                  to: ui.catalog.to,
                  apply: copy.apply,
                  clear: copy.clearPriceRange,
                }}
              />
            </div>
          </section>

          <RecommendedProducts
            products={recommendedPublic}
            locale={locale}
            title={ui.productPage.recommended}
          />

          <section aria-labelledby="catalog-results-title">
            <h2 id="catalog-results-title" className="sr-only">
              {hero.title}
            </h2>
            {/* While a filter/sort/page change loads, the grid is swapped for a same-size skeleton. */}
            <CatalogResults skeleton={<ProductGridSkeleton count={Math.min(8, Math.max(publicProducts.length, 4))} />}>
              <ProductGrid products={publicProducts} locale={locale} />
            </CatalogResults>
          </section>

          {listing.total > listing.pageSize ? (
            <div className="mt-8">
              <Pagination total={listing.total} page={listing.page} pageSize={listing.pageSize} />
            </div>
          ) : null}
        </div>

        <CatalogCartRail />
      </main>
    </div>
    </CatalogNavigationProvider>
  );
}
