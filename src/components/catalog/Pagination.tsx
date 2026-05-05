"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function buildPageItems(page: number, totalPages: number): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: Array<number | "..."> = [];
  const add = (value: number | "...") => {
    if (items[items.length - 1] === value) return;
    items.push(value);
  };

  add(1);

  const left = Math.max(2, page - 2);
  const right = Math.min(totalPages - 1, page + 2);

  if (left > 2) add("...");
  for (let p = left; p <= right; p += 1) add(p);
  if (right < totalPages - 1) add("...");

  add(totalPages);

  return items;
}

export function Pagination({
  total,
  page,
  pageSize,
}: {
  total: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const items = useMemo(() => buildPageItems(page, totalPages), [page, totalPages]);

  if (totalPages <= 1) return null;

  function goToPage(next: number) {
    const target = Math.min(totalPages, Math.max(1, next));
    const params = new URLSearchParams(searchParams.toString());

    if (target <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(target));
    }

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="h-9 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-300"
      >
        Prev
      </button>

      <div className="flex items-center gap-1">
        {items.map((item, idx) => {
          if (item === "...") {
            return (
              <span key={`e-${idx}`} className="px-2 text-sm text-gray-400">
                ...
              </span>
            );
          }

          const isActive = item === page;
          return (
            <button
              key={item}
              type="button"
              onClick={() => goToPage(item)}
              aria-current={isActive ? "page" : undefined}
              className={[
                "h-9 min-w-[36px] rounded-lg px-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#1a2332] text-amber-700"
                  : "border border-gray-200 text-gray-700 hover:border-gray-300",
              ].join(" ")}
            >
              {item}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        className="h-9 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-300"
      >
        Next
      </button>
    </nav>
  );
}
