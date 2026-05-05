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
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
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
              "h-9 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#1a2332] text-amber-700"
                : "border border-gray-200 text-gray-700 hover:border-gray-300",
            ].join(" ")}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

