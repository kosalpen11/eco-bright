"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ProductSortMode } from "@/lib/types";

const OPTIONS: Array<{ value: ProductSortMode; label: string }> = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name A–Z" },
];

function isSortMode(value: string): value is ProductSortMode {
  return OPTIONS.some((opt) => opt.value === value);
}

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
      className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-amber-700 focus:outline-none focus:ring-0"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

