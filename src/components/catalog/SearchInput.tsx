"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
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

  function updateQuery(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    const next = nextValue.trim();

    if (!next) {
      params.delete("q");
    } else {
      params.set("q", next);
    }

    params.delete("page");
    const qs = params.toString();
    const targetPath =
      pathname === "/products" || pathname.startsWith("/catalog/") ? pathname : "/products";
    router.replace(qs ? `${targetPath}?${qs}` : targetPath, { scroll: false });
  }

  function scheduleUpdate(nextValue: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      updateQuery(nextValue);
    }, 300);
  }

  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-text-muted)]" />
      <input
        key={query}
        type="search"
        defaultValue={query}
        placeholder={copy.searchPlaceholder}
        onChange={(e) => scheduleUpdate(e.currentTarget.value)}
        className="h-12 w-full rounded-full border border-[var(--app-border)] bg-white pl-10 pr-11 text-sm text-[var(--app-text)] shadow-sm outline-none placeholder:text-[var(--app-text-faint)] focus:border-[var(--app-primary)] focus:bg-[var(--app-bg-soft)]"
      />
      {query ? (
        <button
          type="button"
          onClick={() => updateQuery("")}
          className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--app-text-muted)] hover:bg-[var(--app-surface)] hover:text-[var(--app-text)]"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </label>
  );
}
