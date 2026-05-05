"use client";

import { SearchX, SlidersHorizontal } from "lucide-react";
import { useLocale } from "@/components/locale/locale-provider";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductSort } from "@/components/product/product-sort";
import { Button } from "@/components/ui/button";
import { getUiText } from "@/lib/i18n";
import type {
  ProductFilterValue,
  ProductGroupMode,
  ProductSortMode,
} from "@/types/product";

interface ProductToolbarProps {
  filter: ProductFilterValue;
  groupMode: ProductGroupMode;
  sortMode: ProductSortMode;
  stateMeta: string;
  isSearchActive: boolean;
  showSearchOptions: boolean;
  onToggleSearchOptions: () => void;
  onResetCatalogView: () => void;
  onFilterChange: (value: ProductFilterValue) => void;
  onGroupModeChange: (value: ProductGroupMode) => void;
  onSortModeChange: (value: ProductSortMode) => void;
}

export function ProductToolbar({
  filter,
  groupMode,
  sortMode,
  stateMeta,
  isSearchActive,
  showSearchOptions,
  onToggleSearchOptions,
  onResetCatalogView,
  onFilterChange,
  onGroupModeChange,
  onSortModeChange,
}: ProductToolbarProps) {
  const { locale } = useLocale();
  const copy = getUiText(locale).storefront;
  const showControls = !isSearchActive || showSearchOptions;

  return (
    <div className="rounded-[1.75rem] border border-app-border bg-app-surface p-4 shadow-[var(--app-shadow-surface)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="locale-label text-[0.74rem] font-semibold uppercase text-app-primary">
            {copy.toolbarTitle}
          </p>
          <p className="max-w-2xl text-sm leading-6 text-app-text-muted">
            {copy.toolbarDescription}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isSearchActive ? (
            <Button
              type="button"
              variant="surface"
              size="sm"
              onClick={onToggleSearchOptions}
            >
              <SlidersHorizontal className="size-4" />
              {showSearchOptions ? copy.hideOptions : copy.showOptions}
            </Button>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetCatalogView}
          >
            <SearchX className="size-4" />
            {copy.resetCatalogView}
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-[1.25rem] border border-app-border bg-app-surface-2 px-4 py-3 text-sm font-semibold text-app-text-soft">
        {stateMeta}
      </div>

      {showControls ? (
        <div className="mt-4 space-y-4 border-t border-app-border pt-4">
          <ProductSort
            groupMode={groupMode}
            sortMode={sortMode}
            onGroupModeChange={onGroupModeChange}
            onSortModeChange={onSortModeChange}
          />

          <ProductFilters value={filter} onValueChange={onFilterChange} />
        </div>
      ) : null}
    </div>
  );
}
