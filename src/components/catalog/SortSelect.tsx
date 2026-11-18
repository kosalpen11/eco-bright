"use client";

import { ArrowUpDown } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { FILTER_SELECT_CLASS, FILTER_SELECT_ICON_CLASS } from "@/components/catalog/BrandSelect";
import { useCatalogRouter } from "@/components/catalog/catalog-navigation";

import type { ProductSortMode } from "@/lib/types";
import { useLocale } from "@/components/locale/locale-provider";
import { buildCatalogHref, getCatalogParams } from "@/lib/catalog-url";
import { getUiText } from "@/lib/i18n";

function getOptions(copy: ReturnType<typeof getUiText>["catalog"]) {
  return [
    { value: "default" as const, label: copy.sortDefault },
    { value: "price-asc" as const, label: copy.sortPriceAsc },
    { value: "price-desc" as const, label: copy.sortPriceDesc },
    { value: "name-asc" as const, label: copy.sortNameAsc },
  ];
}

function isSortMode(value: string): value is ProductSortMode {
  return value === "default" || value === "price-asc" || value === "price-desc" || value === "name-asc";
}

export function SortSelect() {
  const router = useCatalogRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const copy = getUiText(locale).catalog;
  const OPTIONS = getOptions(copy);

  const current = searchParams.get("sort");
  const value: ProductSortMode = current && isSortMode(current) ? current : "default";

  function setSort(next: ProductSortMode) {
    const params = getCatalogParams(pathname, searchParams);

    if (next === "default") {
      params.delete("sort");
    } else {
      params.set("sort", next);
    }

    params.delete("page");
    router.replace(buildCatalogHref(params), { scroll: false });
  }

  return (
    <div className="relative min-w-0">
    <select
      aria-label={copy.sortBy}
      key={value}
      defaultValue={value}
      onChange={(e) => setSort(e.currentTarget.value as ProductSortMode)}
      className={FILTER_SELECT_CLASS}
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <ArrowUpDown className={FILTER_SELECT_ICON_CLASS} aria-hidden="true" />
    </div>
  );
}
