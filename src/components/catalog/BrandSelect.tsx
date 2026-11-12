"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const copy = getUiText(locale).catalog;

  const value = activeBrand ?? "all";

  function go(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("brand"); // legacy (if present)

    const qs = params.toString();
    const targetPath =
      !next || next === "all"
        ? "/products"
        : `/catalog/${encodeURIComponent(next)}`;

    router.replace(qs ? `${targetPath}?${qs}` : targetPath, { scroll: false });
  }

  // If this component ends up mounted on a different route, still behave predictably.
  const shouldShow = pathname === "/products" || pathname.startsWith("/catalog/");
  if (!shouldShow) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs font-medium uppercase tracking-wider text-[var(--app-text-muted)]">
        {copy.brand}
      </div>
      <select
        aria-label={copy.brand}
        key={value}
        defaultValue={value}
        onChange={(e) => go(e.currentTarget.value)}
        className="h-11 rounded-full border border-[var(--app-border)] bg-white px-4 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
      >
        <option value="all">{copy.allBrands}</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.label} ({b.count})
          </option>
        ))}
      </select>
    </div>
  );
}
