import Image from "next/image";
import Link from "next/link";
import { MessageCircle, SlidersHorizontal, X } from "lucide-react";

import { BrandSelect } from "@/components/catalog/BrandSelect";
import { CatalogCartRail } from "@/components/catalog/CatalogCartRail";
import { CategoryBar } from "@/components/catalog/CategoryBar";
import { Pagination } from "@/components/catalog/Pagination";
import { PriceRangeFilter } from "@/components/catalog/PriceRangeFilter";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SearchInput } from "@/components/catalog/SearchInput";
import { SortSelect } from "@/components/catalog/SortSelect";
import { getBrands, getCategories, getProducts } from "@/lib/db/products";
import { TELEGRAM_OWNER_URL } from "@/lib/constants";
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

function buildBrowseTitle(params: {
  brand?: string | null;
  category?: string | null;
  query?: string | null;
  total: number;
}) {
  if (params.query) {
    return {
      eyebrow: "Search results",
      title: `Results for "${params.query}"`,
      subtitle: `${params.total} products matched your search.`,
    };
  }

  if (params.category) {
    return {
      eyebrow: "Category",
      title: params.category,
      subtitle: `${params.total} products ready to browse.`,
    };
  }

  if (params.brand) {
    return {
      eyebrow: "Brand collection",
      title: params.brand,
      subtitle: `${params.total} products in this brand catalog.`,
    };
  }

  return {
    eyebrow: "Eco Bright catalog",
      title: "Browse products",
      subtitle: `${params.total} products available.`,
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
      getProducts(filters),
      getCategories({ brand: filters.brand }),
      getBrands(),
    ]);

  const allCount = dbCategories.reduce((acc, item) => acc + item.count, 0);
  const categories = buildCategoryPills(dbCategories, allCount);
  const activeProducts = getActiveProducts(products);
  const publicProducts = activeProducts.map(mapProductToPublicProduct);
  const hero = buildBrowseTitle({
    brand: filters.brand,
    category: categories.find((item) => item.id === category)?.label ?? category,
    query: q,
    total,
  });
  const activeFilterChips = [
    q ? { label: `Search: ${q}` } : null,
    category ? { label: `Category: ${hero.title === category ? category : hero.title}` } : null,
    filters.brand ? { label: `Brand: ${filters.brand}` } : null,
    minPrice !== null ? { label: `Min: $${minPrice}` } : null,
    maxPrice !== null ? { label: `Max: $${maxPrice}` } : null,
    sort !== "default" ? { label: `Sort: ${sort}` } : null,
  ].filter((item): item is { label: string } => Boolean(item));
  const hasActiveFilters = activeFilterChips.length > 0;
  const clearFiltersHref = buildClearFiltersHref(filters.brand);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <header className="sticky top-0 z-40 border-b border-[var(--app-border)] bg-[rgba(248,250,247,0.94)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-3 py-3 sm:px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <Image
              src="/ecobright-logo.jpeg"
              alt="Eco Bright"
              width={34}
              height={34}
              className="rounded-xl"
              priority
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-bold tracking-[0.12em] text-[var(--app-text)] uppercase">
                Eco Bright
              </div>
              <div className="truncate text-[11px] text-[var(--app-text-muted)]">Lighting catalog</div>
            </div>
          </Link>

          <div className="min-w-0 flex-1">
            <SearchInput />
          </div>

          <a
            href={TELEGRAM_OWNER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--app-border)] bg-white text-[var(--app-primary)] shadow-sm"
            aria-label="Contact Eco Bright"
          >
            <MessageCircle className="size-5" />
          </a>
        </div>

        <div className="mx-auto w-full max-w-7xl px-3 pb-3 sm:px-4">
          <CategoryBar categories={categories} activeCategory={categoryParam || "all"} />
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-3 py-4 sm:px-4 sm:py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
        <section className="rounded-[1.6rem] border border-[var(--app-border)] bg-white p-4 shadow-[var(--app-shadow-surface)] sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
                  <SlidersHorizontal className="size-4" />
                  {hero.eyebrow}
                </div>
                <div className="mt-1 text-xl font-bold text-[var(--app-text)] sm:text-2xl">{hero.title}</div>
                <div className="mt-2 text-sm text-[var(--app-text-muted)]">
                  {hero.subtitle} Showing {publicProducts.length} on this page.
                </div>
              </div>

              {hasActiveFilters ? (
                <Link
                  href={clearFiltersHref}
                  className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-sm font-semibold text-[var(--app-text-soft)] hover:border-[var(--app-border-strong)] hover:bg-[var(--app-surface-2)]"
                >
                  <X className="size-4" />
                  Clear filters
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
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
                  Search products
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
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
                  Sort
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
