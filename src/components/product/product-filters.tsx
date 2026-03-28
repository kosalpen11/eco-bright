"use client";

import { useLocale } from "@/components/locale/locale-provider";
import { getCategoryLabel, getUiText } from "@/lib/i18n";
import { PRODUCT_CATEGORIES } from "@/types/product";
import type { ProductFilterValue } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  value: ProductFilterValue;
  onValueChange: (value: ProductFilterValue) => void;
}

export function ProductFilters({ value, onValueChange }: ProductFiltersProps) {
  const { locale } = useLocale();
  const copy = getUiText(locale).storefront;
  const filters = [
    { value: "all", label: copy.allProducts },
    ...PRODUCT_CATEGORIES.map((category) => ({
      value: category.value,
      label: getCategoryLabel(category.value, locale),
    })),
  ] as const;

  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => {
        const active = value === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onValueChange(filter.value)}
            className={cn(
              "locale-chip rounded-full border px-4 py-3 text-sm font-bold uppercase",
              active
                ? "border-app-primary bg-app-primary text-app-qr-text"
                : "border-app-border bg-app-surface-2 text-app-text-muted hover:border-app-secondary hover:bg-app-secondary-soft hover:text-app-text",
            )}
            aria-pressed={active}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
