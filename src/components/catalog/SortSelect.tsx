"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ProductSortMode } from "@/lib/types";
import { useLocale } from "@/components/locale/locale-provider";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const copy = getUiText(locale).catalog;
  const OPTIONS = getOptions(copy);

  const current = searchParams.get("sort");
  const value: ProductSortMode = current && isSortMode(current) ? current : "default";

  function setSort(next: ProductSortMode) {
    const params = new URLSearchParams(searchParams.toString());

    if (next === "default") {
      params.delete("sort");
    } else {
      params.set("sort", next);
    }

    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <select
      key={value}
      defaultValue={value}
      onChange={(e) => setSort(e.currentTarget.value as ProductSortMode)}
      className="h-11 rounded-full border border-[var(--app-border)] bg-white px-4 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
