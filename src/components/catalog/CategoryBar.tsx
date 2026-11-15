"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCatalogRouter } from "@/components/catalog/catalog-navigation";
import { buildCatalogHref, getCatalogParams, isCatalogPath } from "@/lib/catalog-url";

import type { ProductCategory } from "@/lib/types";

export function CategoryBar({
  categories,
  activeCategory,
}: {
  categories: ProductCategory[];
  activeCategory: string;
}) {
  const router = useCatalogRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onCatalog = isCatalogPath(pathname);

  // Real links (/category/{slug}) so crawlers can follow them; other filters are kept on the catalog.
  function hrefFor(nextCategory: string) {
    const params = getCatalogParams(pathname, searchParams);
    if (!nextCategory || nextCategory === "all") params.delete("category");
    else params.set("category", nextCategory);
    params.delete("page");
    return buildCatalogHref(params);
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
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

        const href = hrefFor(category.id);

        return (
          <Link
            key={category.id}
            href={href}
            prefetch={false}
            onClick={(event) => handleClick(event, href)}
            aria-current={isActive ? "page" : undefined}
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
          </Link>
        );
      })}
    </div>
  );
}
