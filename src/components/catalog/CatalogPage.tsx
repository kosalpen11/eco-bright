import Image from "next/image";

import { BrandSelect } from "@/components/catalog/BrandSelect";
import { CategoryBar } from "@/components/catalog/CategoryBar";
import { Pagination } from "@/components/catalog/Pagination";
import { PriceRangeFilter } from "@/components/catalog/PriceRangeFilter";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SearchInput } from "@/components/catalog/SearchInput";
import { SortSelect } from "@/components/catalog/SortSelect";
import { getBrands, getCategories, getProducts } from "@/lib/db/products";
import { TELEGRAM_OWNER_URL } from "@/lib/constants";
import type { ProductCategory, ProductFilters, ProductSortMode } from "@/lib/types";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const SORT_MODES = ["default", "price-asc", "price-desc", "name-asc"] as const satisfies ReadonlyArray<ProductSortMode>;

const CATEGORY_PILLS = [
  { id: "led-tubes", label: "LED Tubes" },
  { id: "panel-lights", label: "Panel Lights" },
  { id: "ceiling-lights", label: "Ceiling Lights" },
  { id: "bulbs", label: "Bulbs" },
  { id: "emergency", label: "Emergency" },
  { id: "string-lights", label: "String Lights" },
  { id: "led-strips", label: "LED Strips" },
  { id: "fans", label: "Fans" },
  { id: "wire-cable", label: "Wire / Cable" },
  { id: "drivers", label: "Drivers" },
] as const satisfies ReadonlyArray<{ id: string; label: string }>;

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
  const counts = new Map(dbCategories.map((c) => [c.id, c.count]));

  return [
    { id: "all", label: "All Products", count: allCount },
    ...CATEGORY_PILLS.map((pill) => ({
      id: pill.id,
      label: pill.label,
      count: counts.get(pill.id) ?? 0,
    })),
  ];
}

export async function CatalogPage({
  searchParams,
  brand,
}: {
  searchParams: SearchParams;
  brand?: string | null;
}) {
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

  const allCount = dbCategories.reduce((acc, c) => acc + c.count, 0);
  const categories = buildCategoryPills(dbCategories, allCount);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white">
        <div className="border-b border-gray-100 bg-gray-50">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-end px-4 py-2">
            <a
              href={TELEGRAM_OWNER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-amber-700"
              aria-label="Contact sales on Telegram"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                aria-hidden="true"
                fill="currentColor"
              >
                <path d="M9.993 15.544 9.83 19.1c.35 0 .503-.15.686-.33l1.645-1.57 3.41 2.496c.625.345 1.067.163 1.223-.577l2.216-10.39c.227-1.01-.37-1.404-.98-1.18L4.24 11.39c-.96.38-.946.925-.165 1.17l3.56 1.11 8.26-5.22c.39-.24.744-.11.452.13z" />
              </svg>
              Contact Sales
            </a>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
          <div className="min-w-[180px]">
            <div className="flex items-center gap-2">
              <Image
                src="/ecobright-logo.jpeg"
                alt="EcoBright"
                width={28}
                height={28}
                className="rounded"
                priority
              />
              <div className="text-base font-semibold tracking-tight text-gray-900">
                EcoBright
              </div>
            </div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
              Product Catalog
            </div>
          </div>

          <div className="flex-1">
            <SearchInput />
          </div>

          <div className="min-w-[92px] text-right">
            <div className="text-2xl font-semibold leading-none text-amber-700">
              {total}
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
              Products
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-3">
          <CategoryBar categories={categories} activeCategory={categoryParam || "all"} />
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-900">{products.length}</span>{" "}
            of <span className="font-medium text-gray-900">{total}</span>{" "}
            products
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <BrandSelect brands={brands} activeBrand={filters.brand ?? null} />
            <PriceRangeFilter />
            <div className="flex items-center gap-2">
              <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Sort by
              </div>
              <SortSelect />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <ProductGrid products={products} />
        </div>

        <div className="mt-8">
          <Pagination total={total} page={currentPage} pageSize={pageSize} />
        </div>
      </main>
    </div>
  );
}
