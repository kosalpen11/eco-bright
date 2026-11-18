"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCatalogRouter } from "@/components/catalog/catalog-navigation";
import { useLocale } from "@/components/locale/locale-provider";
import { buildCatalogHref, getCatalogParams, isCatalogPath } from "@/lib/catalog-url";
import { getUiText } from "@/lib/i18n";

/** Shared look for the compact catalog filter selects (brand, sort). */
export const FILTER_SELECT_CLASS =
  "h-11 w-full min-w-0 cursor-pointer appearance-none truncate rounded-full border border-[var(--app-border)] bg-white pl-4 pr-9 text-sm font-medium text-[var(--app-text)] outline-none transition hover:border-[var(--app-border-strong)] focus:border-[var(--app-primary)] lg:h-10 lg:w-auto";
export const FILTER_SELECT_ICON_CLASS =
  "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-text-muted)]";

export interface BrandOption {
  id: string;
  label: string;
  count: number;
}

export function BrandSelect({
  brands,
  activeBrand,
}: {
  brands: BrandOption[];
  activeBrand: string | null;
}) {
  const router = useCatalogRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const copy = getUiText(locale).catalog;

  const value = activeBrand ?? "all";

  function go(next: string) {
    const params = getCatalogParams(pathname, searchParams);
    params.delete("page");
    if (!next || next === "all") params.delete("brand");
    else params.set("brand", next);

    router.replace(buildCatalogHref(params), { scroll: false });
  }

  // If this component ends up mounted on a different route, still behave predictably.
  const shouldShow = isCatalogPath(pathname);
  if (!shouldShow) return null;

  return (
    <div className="relative min-w-0">
      <select
        aria-label={copy.brand}
        key={value}
        defaultValue={value}
        onChange={(e) => go(e.currentTarget.value)}
        className={FILTER_SELECT_CLASS}
      >
        <option value="all">{copy.allBrands}</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.label} ({b.count})
          </option>
        ))}
      </select>
      <ChevronDown className={FILTER_SELECT_ICON_CLASS} aria-hidden="true" />
    </div>
  );
}
