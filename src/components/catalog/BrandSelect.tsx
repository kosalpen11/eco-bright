"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
        Brand
      </div>
      <select
        key={value}
        defaultValue={value}
        onChange={(e) => go(e.currentTarget.value)}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-amber-700 focus:outline-none focus:ring-0"
      >
        <option value="all">All Brands</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.label} ({b.count})
          </option>
        ))}
      </select>
    </div>
  );
}

