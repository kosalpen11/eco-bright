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
    const targetPath =
      pathname === "/products" || pathname.startsWith("/catalog/") ? pathname : "/products";
    router.replace(qs ? `${targetPath}?${qs}` : targetPath, { scroll: false });
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
              "shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-white shadow-sm"
                : "border-[var(--app-border)] bg-[var(--app-surface-2)] text-[var(--app-text-soft)] hover:border-[var(--app-border-strong)] hover:bg-[var(--app-card)]",
            ].join(" ")}
          >
            {category.label}
            <span
              className={
                isActive ? "ml-2 text-white/75" : "ml-2 text-[var(--app-text-muted)]"
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
