"use client";

import { useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";

function parsePriceInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function PriceRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const copy = getUiText(locale).catalog;

  const minRef = useRef<HTMLInputElement | null>(null);
  const maxRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const minParam = searchParams.get("minPrice") ?? "";
  const maxParam = searchParams.get("maxPrice") ?? "";

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const hasPriceFilter = Boolean(minParam || maxParam);

  function scheduleUpdate() {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const minValue = parsePriceInput(minRef.current?.value ?? "");
      const maxValue = parsePriceInput(maxRef.current?.value ?? "");

      const params = new URLSearchParams(searchParams.toString());

      if (minValue === null) params.delete("minPrice");
      else params.set("minPrice", String(minValue));

      if (maxValue === null) params.delete("maxPrice");
      else params.set("maxPrice", String(maxValue));

      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 300);
  }

  function clearPriceRange() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs font-medium uppercase tracking-wider text-[var(--app-text-muted)]">
        {copy.price}
      </div>

      <div className="flex items-center gap-2">
        <input
          key={`min:${minParam}`}
          ref={minRef}
          type="number"
          min={0}
          step="0.01"
          defaultValue={minParam}
          placeholder={copy.min}
          onChange={scheduleUpdate}
          className="h-11 w-[110px] rounded-full border border-[var(--app-border)] bg-white px-4 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-faint)] outline-none focus:border-[var(--app-primary)]"
        />

        <span className="text-sm text-[var(--app-text-faint)]">{copy.to}</span>

        <input
          key={`max:${maxParam}`}
          ref={maxRef}
          type="number"
          min={0}
          step="0.01"
          defaultValue={maxParam}
          placeholder={copy.max}
          onChange={scheduleUpdate}
          className="h-11 w-[110px] rounded-full border border-[var(--app-border)] bg-white px-4 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-faint)] outline-none focus:border-[var(--app-primary)]"
        />

        {hasPriceFilter ? (
          <button
            type="button"
            onClick={clearPriceRange}
            className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--app-border)] bg-white text-[var(--app-text-muted)] hover:border-[var(--app-border-strong)] hover:text-[var(--app-text)]"
            aria-label="Clear price range"
          >
            <RotateCcw className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
