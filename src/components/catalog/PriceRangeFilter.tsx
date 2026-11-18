"use client";

import type { FormEvent, MouseEvent } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { useCatalogRouter } from "@/components/catalog/catalog-navigation";
import { buildCatalogHref } from "@/lib/catalog-url";

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
    router.push(buildCatalogHref(params), { scroll: false });
  }

  function handleClear(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    router.push(clearHref, { scroll: false });
  }
  const inputClass =
    "h-full w-full min-w-0 bg-transparent pl-6 pr-2 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-faint)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none lg:w-[4.5rem]";

  return (
    <form
      action="/products"
      method="get"
      onSubmit={handleSubmit}
      className="flex min-w-0 items-center gap-2"
      aria-label={labels.price}
    >
      {Object.entries(preserved).map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null,
      )}

      {/* One pill: "$ min – $ max", so the range takes the width of a single control. */}
      <div className="flex h-11 min-w-0 flex-1 items-center rounded-full border border-[var(--app-border)] bg-white transition focus-within:border-[var(--app-primary)] hover:border-[var(--app-border-strong)] lg:h-10 lg:flex-none">
        <label className="relative flex h-full min-w-0 flex-1 items-center">
          <span className="sr-only">
            {labels.price} ({labels.min})
          </span>
          <span className="pointer-events-none absolute left-3 text-sm text-[var(--app-text-muted)]" aria-hidden="true">
            $
          </span>
          <input
            type="number"
            name="min"
            min={0}
            step="0.01"
            inputMode="decimal"
            defaultValue={min ?? ""}
            placeholder={labels.min}
            className={inputClass}
          />
        </label>
        <span className="shrink-0 text-sm text-[var(--app-text-faint)]" aria-hidden="true">
          –
        </span>
        <label className="relative flex h-full min-w-0 flex-1 items-center">
          <span className="sr-only">
            {labels.price} ({labels.max})
          </span>
          <span className="pointer-events-none absolute left-3 text-sm text-[var(--app-text-muted)]" aria-hidden="true">
            $
          </span>
          <input
            type="number"
            name="max"
            min={0}
            step="0.01"
            inputMode="decimal"
            defaultValue={max ?? ""}
            placeholder={labels.max}
            className={inputClass}
          />
        </label>
      </div>

      <button
        type="submit"
        className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--app-primary-hover)] lg:h-10"
      >
        {labels.apply}
      </button>
      {hasPriceFilter ? (
        <Link
          href={clearHref}
          onClick={handleClear}
          aria-label={labels.clear}
          title={labels.clear}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--app-text-muted)] transition hover:bg-[var(--app-surface)] hover:text-[var(--app-text)] lg:size-10"
        >
          <X className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </form>
  );
}
