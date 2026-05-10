"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";

export function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { locale } = useLocale();
  const copy = getUiText(locale).catalog;

  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function scheduleUpdate(nextValue: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const next = nextValue.trim();

      if (!next) {
        params.delete("q");
      } else {
        params.set("q", next);
      }

      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 300);
  }

  return (
    <input
      key={query}
      type="search"
      defaultValue={query}
      placeholder={copy.searchPlaceholder}
      onChange={(e) => scheduleUpdate(e.currentTarget.value)}
      className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-700 focus:outline-none focus:ring-0"
    />
  );
}
