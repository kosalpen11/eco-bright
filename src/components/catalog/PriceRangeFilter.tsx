"use client";

import type { FormEvent, MouseEvent } from "react";
import Link from "next/link";

import { useCatalogRouter } from "@/components/catalog/catalog-navigation";

/**
 * Price filter as a plain GET form, so it still works before JavaScript loads.
 * With JavaScript, Apply/clear navigate in a transition (progress bar + skeleton grid).
 * Submitting keeps the other filters (hidden inputs) and resets to page 1.
 */
export function PriceRangeFilter({
  min,
  max,
  preserved,
  clearHref,
  labels,
}: {
  min: number | null;
  max: number | null;
  preserved: Record<string, string | null>;
  clearHref: string;
  labels: { price: string; min: string; max: string; to: string; apply: string; clear: string };
}) {
  const router = useCatalogRouter();
  const hasPriceFilter = min !== null || max !== null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    for (const [name, value] of new FormData(event.currentTarget)) {
      if (typeof value === "string" && value.trim()) params.set(name, value.trim());
    }
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products", { scroll: false });
  }

  function handleClear(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    router.push(clearHref, { scroll: false });
  }
  const inputClass =
    "h-11 w-full min-w-0 rounded-full border border-[var(--app-border)] bg-white px-4 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-faint)] focus:border-[var(--app-primary)] sm:w-[120px]";

  return (
    <form
      action="/products"
      method="get"
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-2"
      aria-label={labels.price}
    >
      {Object.entries(preserved).map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null,
      )}

      <label className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-none">
        <span className="locale-label text-xs font-medium uppercase text-[var(--app-text-muted)]">
          {labels.price} ({labels.min})
        </span>
        <input
          type="number"
          name="min"
          min={0}
          step="0.01"
          inputMode="decimal"
          defaultValue={min ?? ""}
          placeholder="$0"
          className={inputClass}
        />
      </label>
      <span className="pb-3 text-sm text-[var(--app-text-faint)]" aria-hidden="true">
        {labels.to}
      </span>
      <label className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-none">
        <span className="locale-label text-xs font-medium uppercase text-[var(--app-text-muted)]">
          {labels.price} ({labels.max})
        </span>
        <input
          type="number"
          name="max"
          min={0}
          step="0.01"
          inputMode="decimal"
          defaultValue={max ?? ""}
          placeholder="$100"
          className={inputClass}
        />
      </label>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--app-primary-hover)]"
        >
          {labels.apply}
        </button>
        {hasPriceFilter ? (
          <Link
            href={clearHref}
            onClick={handleClear}
            className="inline-flex h-11 items-center px-2 text-sm font-semibold text-[var(--app-primary)] underline-offset-2 hover:underline"
          >
            {labels.clear}
          </Link>
        ) : null}
      </div>
    </form>
  );
}
