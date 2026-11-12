import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";

import { BrandSelect } from "@/components/catalog/BrandSelect";
import { CatalogCartRail } from "@/components/catalog/CatalogCartRail";
import { Pagination } from "@/components/catalog/Pagination";
import { PriceRangeFilter } from "@/components/catalog/PriceRangeFilter";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SearchInput } from "@/components/catalog/SearchInput";
import { SortSelect } from "@/components/catalog/SortSelect";
import { SiteHeader } from "@/components/layout/site-header";
import { getCachedBrands, getCachedCategories, getCachedProducts } from "@/lib/db/cached-products";
import { getUiText, localizeText } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale-server";
import { getActiveProducts, mapProductToPublicProduct } from "@/lib/public-products";
import type { ProductCategory, ProductFilters, ProductSortMode } from "@/lib/types";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const SORT_MODES = ["default", "price-asc", "price-desc", "name-asc"] as const satisfies ReadonlyArray<ProductSortMode>;

function firstValue(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function parsePositiveNumber(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function parseSort(value: string | null): ProductSortMode | null {
  if (!value) return null;
  return (SORT_MODES as readonly string[]).includes(value) ? (value as ProductSortMode) : null;
}

function buildCategoryPills(dbCategories: ProductCategory[], allCount: number): ProductCategory[] {
  return [{ id: "all", label: "All", count: allCount }, ...dbCategories];
}

type CatalogCopy = ReturnType<typeof getUiText>["catalogPage"];

function buildBrowseTitle(
  params: {
    brand?: string | null;
    category?: string | null;
    query?: string | null;
    total: number;
  },
  copy: CatalogCopy,
) {
  if (params.query) {
    return {
      eyebrow: copy.searchResults,
      title: copy.resultsFor(params.query),
      subtitle: copy.matched(params.total),
    };
  }

  if (params.category) {
    return {
      eyebrow: copy.category,
      title: params.category,
      subtitle: copy.readyToBrowse(params.total),
    };
  }

  if (params.brand) {
    return {
      eyebrow: copy.brandCollection,
      title: params.brand,
      subtitle: copy.inBrand(params.total),
    };
  }

  return {
    eyebrow: copy.catalogEyebrow,
    title: copy.browseTitle,
    subtitle: copy.available(params.total),
  };
}

function buildBaseCatalogPath(brand?: string | null) {
  return brand?.trim() ? `/catalog/${encodeURIComponent(brand.trim())}` : "/products";
}

function buildClearFiltersHref(brand?: string | null) {
  return buildBaseCatalogPath(brand);
}

export async function CatalogPage({
  searchParams,
  brand,
}: {
  searchParams: SearchParams;
  brand?: string | null;
}) {
  const locale = await getRequestLocale();
  const sp = await searchParams;

  const categoryParam = (firstValue(sp.category) ?? "").trim();
  const category = categoryParam && categoryParam !== "all" ? categoryParam : null;
  const q = (firstValue(sp.q) ?? "").trim() || null;
  const sort = parseSort(firstValue(sp.sort)) ?? "default";
  const pageRaw = firstValue(sp.page);
  const page = Math.max(1, Number.isFinite(Number(pageRaw)) ? Math.floor(Number(pageRaw)) : 1);
  const minPrice = parsePositiveNumber(firstValue(sp.minPrice));
  const maxPrice = parsePositiveNumber(firstValue(sp.maxPrice));

  const filters: ProductFilters = {
    brand: brand?.trim() ? brand.trim() : null,
    category,
    q,
    sort,
    page,
    minPrice,
    maxPrice,
  };

  const [{ products, total, page: currentPage, pageSize }, dbCategories, brands] =
    await Promise.all([
      getCachedProducts(filters),
      getCachedCategories({ brand: filters.brand }),
      getCachedBrands(),
    ]);

  const allCount = dbCategories.reduce((acc, item) => acc + item.count, 0);
  const categories = buildCategoryPills(dbCategories, allCount);
  const activeProducts = getActiveProducts(products);
  const publicProducts = activeProducts.map(mapProductToPublicProduct);
  const ui = getUiText(locale);
  const copy = ui.catalogPage;
  const activeCategory = categories.find((item) => item.id === category);
  const categoryLabel = activeCategory
    ? localizeText(locale, activeCategory.label, activeCategory.labelKm)
    : category;
  const sortLabels: Record<ProductSortMode, string> = {
    default: ui.catalog.sortDefault,
    "price-asc": ui.catalog.sortPriceAsc,
    "price-desc": ui.catalog.sortPriceDesc,
    "name-asc": ui.catalog.sortNameAsc,
  };
  const hero = buildBrowseTitle(
    {
      brand: filters.brand,
      category: categoryLabel,
      query: q,
      total,
    },
    copy,
  );
  const activeFilterChips = [
    q ? { label: `${copy.chipSearch}: ${q}` } : null,
    category ? { label: `${copy.category}: ${categoryLabel}` } : null,
    filters.brand ? { label: `${copy.chipBrand}: ${filters.brand}` } : null,
    minPrice !== null ? { label: `${copy.chipMin}: $${minPrice}` } : null,
    maxPrice !== null ? { label: `${copy.chipMax}: $${maxPrice}` } : null,
    sort !== "default" ? { label: `${copy.sort}: ${sortLabels[sort]}` } : null,
  ].filter((item): item is { label: string } => Boolean(item));
  const hasActiveFilters = activeFilterChips.length > 0;
  const clearFiltersHref = buildClearFiltersHref(filters.brand);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <SiteHeader categories={categories} activeCategory={categoryParam || "all"} />

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-3 py-4 sm:px-4 sm:py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
        <section className="rounded-[1.6rem] border border-[var(--app-border)] bg-white p-4 shadow-[var(--app-shadow-surface)] sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs locale-label font-semibold uppercase text-[var(--app-text-muted)]">
                  <SlidersHorizontal className="size-4" />
                  {hero.eyebrow}
                </div>
                <div className="mt-1 text-xl font-bold text-[var(--app-text)] sm:text-2xl">{hero.title}</div>
                <div className="mt-2 text-sm text-[var(--app-text-muted)]">
                  {hero.subtitle} {copy.showingOnPage(publicProducts.length)}
                </div>
              </div>

              {hasActiveFilters ? (
                <Link
                  href={clearFiltersHref}
                  className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-sm font-semibold text-[var(--app-text-soft)] hover:border-[var(--app-border-strong)] hover:bg-[var(--app-surface-2)]"
                >
                  <X className="size-4" />
                  {ui.states.clearFilters}
                </Link>
              ) : null}
            </div>

            {hasActiveFilters ? (
              <div className="flex flex-wrap gap-2">
                {activeFilterChips.map((chip) => (
                  <span
                    key={chip.label}
                    className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-xs font-medium text-[var(--app-text-soft)]"
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_auto_auto_auto] xl:items-end">
              <div>
                <div className="mb-2 text-xs locale-label font-medium uppercase text-[var(--app-text-muted)]">
                  {copy.searchProducts}
                </div>
                <SearchInput />
              </div>

              <div className="min-w-0">
                <BrandSelect brands={brands} activeBrand={filters.brand ?? null} />
              </div>

              <div className="min-w-0">
                <PriceRangeFilter />
              </div>

              <div className="min-w-0">
                <div className="mb-2 text-xs locale-label font-medium uppercase text-[var(--app-text-muted)]">
                  {copy.sort}
                </div>
                <SortSelect />
              </div>
            </div>
          </div>
        </section>

        <section>
          <ProductGrid products={publicProducts} locale={locale} />
        </section>

        <div className="mt-8">
          <Pagination total={total} page={currentPage} pageSize={pageSize} />
        </div>
        </div>

        <CatalogCartRail />
      </main>
    </div>
  );
}
