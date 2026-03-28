"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { SearchX, SlidersHorizontal } from "lucide-react";
import { InvoicePanel } from "@/components/cart/invoice-panel";
import { useLocale } from "@/components/locale/locale-provider";
import { SectionHeader } from "@/components/common/section-header";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductSearch } from "@/components/product/product-search";
import { ProductSort } from "@/components/product/product-sort";
import { Button } from "@/components/ui/button";
import { groupProducts } from "@/lib/group-products";
import { formatItemCount, getGroupModeLabel, getSortModeLabel, getUiText } from "@/lib/i18n";
import { searchProducts } from "@/lib/search-products";
import { sortProducts } from "@/lib/sort-products";
import { useCartStore } from "@/store/cart-store";
import type {
  Product,
  ProductFilterValue,
  ProductGroupMode,
  ProductSortMode,
} from "@/types/product";

interface StorefrontShellProps {
  products: Product[];
  catalogError?: string | null;
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || target.isContentEditable;
}

export function StorefrontShell({ products, catalogError }: StorefrontShellProps) {
  const { locale } = useLocale();
  const copy = getUiText(locale).storefront;
  const searchRef = useRef<HTMLInputElement>(null);
  const addItem = useCartStore((state) => state.addItem);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProductFilterValue>("all");
  const [groupMode, setGroupMode] = useState<ProductGroupMode>("category");
  const [sortMode, setSortMode] = useState<ProductSortMode>("featured");
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [isPending, startUiTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const shouldFocusSearch =
        event.key === "/" ||
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k");

      if (!shouldFocusSearch || isTypingTarget(event.target)) {
        return;
      }

      event.preventDefault();
      searchRef.current?.focus();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredProducts = useMemo(
    () =>
      searchProducts(products, {
        category: filter,
        query: deferredQuery,
      }),
    [deferredQuery, filter, products],
  );

  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, sortMode),
    [filteredProducts, sortMode],
  );

  const groupedProducts = useMemo(
    () => groupProducts(sortedProducts, groupMode, locale),
    [groupMode, locale, sortedProducts],
  );

  const groupLabel = getGroupModeLabel(groupMode, locale);
  const sortLabel = getSortModeLabel(sortMode, locale);
  const normalizedQuery = query.trim();
  const isSearchActive = normalizedQuery.length > 0;
  const shouldShowBrowseOptions = !isSearchActive || showSearchOptions;
  const stateMeta = isSearchActive
    ? copy.stateMetaQuery(normalizedQuery, groupLabel)
    : copy.stateMetaDefault(groupLabel, sortLabel);

  function resetCatalogView() {
    startTransition(() => {
      setQuery("");
      setFilter("all");
      setGroupMode("category");
      setSortMode("featured");
      setShowSearchOptions(false);
    });
  }

  return (
    <section id="store" className="relative pb-32 pt-10 lg:pb-16">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_460px] xl:grid-cols-[minmax(0,1fr)_500px] lg:px-8">
        <div className="space-y-6">
          <div className="space-y-4" id="store-controls">
            <ProductSearch
              value={query}
              resultCount={filteredProducts.length}
              isPending={isPending}
              inputRef={searchRef}
              onValueChange={(value) =>
                startUiTransition(() => {
                  setQuery(value);
                  if (value.trim().length === 0) {
                    setShowSearchOptions(false);
                  }
                })
              }
            />

            {isSearchActive ? (
              <div className="flex flex-col gap-3 rounded-[1.5rem] border border-app-border bg-app-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="locale-chip rounded-full border border-app-border bg-app-surface px-4 py-3 text-sm font-semibold uppercase text-app-text-muted">
                  {stateMeta}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="surface"
                    size="sm"
                    onClick={() => setShowSearchOptions((current) => !current)}
                  >
                    <SlidersHorizontal className="size-4" />
                    {showSearchOptions ? copy.hideOptions : copy.showOptions}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={resetCatalogView}>
                    <SearchX className="size-4" />
                    {copy.clearSearch}
                  </Button>
                </div>
              </div>
            ) : null}

            {catalogError ? (
              <div className="rounded-[1.5rem] border border-app-accent bg-app-accent-soft px-4 py-4 text-sm text-app-text-soft">
                <p className="locale-label font-semibold uppercase text-app-accent">
                  {copy.catalogSetupRequired}
                </p>
                <p className="mt-2 text-sm leading-6 text-app-text-soft">
                  {catalogError} {copy.catalogSetupBody}
                </p>
              </div>
            ) : null}
          </div>

          <SectionHeader
            eyebrow={copy.eyebrow}
            title={copy.title}
            accent={copy.accent}
            description={copy.description}
            meta={`${formatItemCount(filteredProducts.length, locale)} / ${formatItemCount(products.length, locale)}`}
          />

          <div className="space-y-4">
            {shouldShowBrowseOptions ? (
              <>
                <ProductSort
                  groupMode={groupMode}
                  sortMode={sortMode}
                  onGroupModeChange={(value) =>
                    startUiTransition(() => {
                      setGroupMode(value);
                    })
                  }
                  onSortModeChange={(value) =>
                    startUiTransition(() => {
                      setSortMode(value);
                    })
                  }
                />
                <ProductFilters
                  value={filter}
                  onValueChange={(value) =>
                    startUiTransition(() => {
                      setFilter(value);
                    })
                  }
                />
              </>
            ) : null}

            {!isSearchActive || showSearchOptions ? (
              <div className="locale-chip rounded-full border border-app-border bg-app-surface-2 px-4 py-3 text-sm font-semibold uppercase text-app-text-muted">
                {stateMeta}
              </div>
            ) : null}
          </div>

          <ProductGrid
            sections={groupedProducts}
            onAddToCart={addItem}
            onResetFilters={resetCatalogView}
          />
        </div>

        <aside id="invoice" className="lg:sticky lg:top-24 lg:h-fit">
          <InvoicePanel />
        </aside>
      </div>
    </section>
  );
}
