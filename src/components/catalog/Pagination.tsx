"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCatalogRouter } from "@/components/catalog/catalog-navigation";
import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";

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
  const router = useCatalogRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const copy = getUiText(locale).catalog;
  const pageCopy = getUiText(locale).catalogPage;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(total, page * pageSize);

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
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false, scrollToResults: true });
  }

  return (
    <nav
      className="rounded-[1.6rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-surface)]"
      aria-label={pageCopy.pagination}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-[var(--app-text)]">
            {pageCopy.showingRange(startItem, endItem, total)}
          </div>
          <div className="text-xs text-[var(--app-text-muted)]">
            {pageCopy.pageOf(page, totalPages)}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="h-11 rounded-full border border-[var(--app-border)] bg-white px-4 text-sm font-medium text-[var(--app-text-soft)] disabled:cursor-not-allowed disabled:opacity-50 hover:border-[var(--app-border-strong)]"
          >
            {copy.prev}
          </button>

          <div className="hidden items-center gap-1 sm:flex">
            {items.map((item, idx) => {
              if (item === "...") {
                return (
                  <span key={`e-${idx}`} className="px-2 text-sm text-[var(--app-text-faint)]">
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
                    "h-11 min-w-[44px] rounded-full px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--app-primary)] text-white"
                      : "border border-[var(--app-border)] bg-white text-[var(--app-text-soft)] hover:border-[var(--app-border-strong)]",
                  ].join(" ")}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div className="rounded-full border border-[var(--app-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--app-text-soft)] sm:hidden">
            {page} / {totalPages}
          </div>

          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="h-11 rounded-full border border-[var(--app-border)] bg-white px-4 text-sm font-medium text-[var(--app-text-soft)] disabled:cursor-not-allowed disabled:opacity-50 hover:border-[var(--app-border-strong)]"
          >
            {copy.next}
          </button>
        </div>
      </div>
    </nav>
  );
}
