"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ProductCategory } from "@/lib/types";

export function CategoryBar({
  categories,
  activeCategory,
}: {
  categories: ProductCategory[];
  activeCategory: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setCategory(nextCategory: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!nextCategory || nextCategory === "all") {
      params.delete("category");
    } else {
      params.set("category", nextCategory);
    }

    params.delete("page");
    const qs = params.toString();
    const onCatalog = pathname === "/products" || pathname.startsWith("/catalog/");
    const targetPath = onCatalog ? pathname : "/products";
    const href = qs ? `${targetPath}?${qs}` : targetPath;
    // Filter in place on the catalog; from other pages (e.g. a product) navigate normally.
    if (onCatalog) {
      router.replace(href, { scroll: false });
    } else {
      router.push(href);
    }
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((category) => {
        const isActive =
          (category.id === "all" && (!activeCategory || activeCategory === "all")) ||
          category.id === activeCategory;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategory(category.id)}
            className={[
              "shrink-0 whitespace-nowrap rounded-full border px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-white shadow-sm"
                : "border-[var(--app-border)] bg-[var(--app-surface-2)] text-[var(--app-text-soft)] hover:border-[var(--app-border-strong)] hover:bg-[var(--app-card)]",
            ].join(" ")}
          >
            {category.label}
            <span
              className={
                isActive ? "ml-2 text-white" : "ml-2 text-[var(--app-text-muted)]"
              }
            >
              {category.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
