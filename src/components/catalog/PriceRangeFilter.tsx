"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
        Price
      </div>

      <div className="flex items-center gap-2">
        <input
          key={`min:${minParam}`}
          ref={minRef}
          type="number"
          min={0}
          step="0.01"
          defaultValue={minParam}
          placeholder="Min"
          onChange={scheduleUpdate}
          className="h-9 w-[110px] rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-700 focus:outline-none focus:ring-0"
        />

        <span className="text-sm text-gray-300">to</span>

        <input
          key={`max:${maxParam}`}
          ref={maxRef}
          type="number"
          min={0}
          step="0.01"
          defaultValue={maxParam}
          placeholder="Max"
          onChange={scheduleUpdate}
          className="h-9 w-[110px] rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-700 focus:outline-none focus:ring-0"
        />
      </div>
    </div>
  );
}
