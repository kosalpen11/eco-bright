"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { CartAdjustPanel } from "@/components/cart/cart-adjust-panel";
import { InvoicePanel } from "@/components/cart/invoice-panel";
import { useLocale } from "@/components/locale/locale-provider";
import { SectionHeader } from "@/components/common/section-header";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductSearch } from "@/components/product/product-search";
import { ProductToolbar } from "@/components/product/product-toolbar";
import { PasteLinkForm } from "@/components/ordering/paste-link-form";
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
  isFallbackCatalog?: boolean;
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || target.isContentEditable;
}

export function StorefrontShell({
  products,
  catalogError,
  isFallbackCatalog = false,
}: StorefrontShellProps) {
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
      <div className="mx-auto grid max-w-[1640px] gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_560px] xl:grid-cols-[minmax(0,1fr)_620px] lg:px-8">
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

            {catalogError ? (
              <div className="rounded-[1.5rem] border border-app-accent bg-app-accent-soft px-4 py-4 text-sm text-app-text-soft">
                <p className="locale-label font-semibold uppercase text-app-accent">
                  {isFallbackCatalog ? copy.catalogFallbackTitle : copy.catalogSetupRequired}
                </p>
                <p className="mt-2 text-sm leading-6 text-app-text-soft">
                  {catalogError} {isFallbackCatalog ? copy.catalogFallbackBody : copy.catalogSetupBody}
                </p>
              </div>
            ) : null}

            <PasteLinkForm />
          </div>

          <SectionHeader
            eyebrow={copy.eyebrow}
            title={copy.title}
            accent={copy.accent}
            description={copy.description}
            meta={`${formatItemCount(filteredProducts.length, locale)} / ${formatItemCount(products.length, locale)}`}
          />

          <ProductToolbar
            filter={filter}
            groupMode={groupMode}
            sortMode={sortMode}
            stateMeta={stateMeta}
            isSearchActive={isSearchActive}
            showSearchOptions={showSearchOptions}
            onToggleSearchOptions={() => setShowSearchOptions((current) => !current)}
            onResetCatalogView={resetCatalogView}
            onFilterChange={(value) =>
              startUiTransition(() => {
                setFilter(value);
              })
            }
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

          <ProductGrid
            sections={groupedProducts}
            onAddToCart={addItem}
            onResetFilters={resetCatalogView}
          />

          <CartAdjustPanel />
        </div>

        <aside id="invoice" className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto">
          <InvoicePanel />
        </aside>
      </div>
    </section>
  );
}
