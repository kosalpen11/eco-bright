"use client";

import type { RefObject } from "react";
import { Search } from "lucide-react";
import { useLocale } from "@/components/locale/locale-provider";
import { Input } from "@/components/ui/input";
import { getUiText } from "@/lib/i18n";

interface ProductSearchProps {
  value: string;
  resultCount: number;
  isPending: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onValueChange: (value: string) => void;
}

export function ProductSearch({
  value,
  resultCount,
  isPending,
  inputRef,
  onValueChange,
}: ProductSearchProps) {
  const { locale } = useLocale();
  const copy = getUiText(locale).storefront;

  return (
    <label className="grid-fade flex min-h-14 items-center gap-3 rounded-[1.5rem] border border-app-border bg-app-surface px-4 py-3">
      <Search className="size-4 shrink-0 text-app-secondary" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="locale-label text-[0.74rem] font-semibold uppercase text-app-text-faint">
          {copy.searchCatalog}
        </span>
        <Input
          ref={inputRef}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          className="h-auto border-none bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
          placeholder={copy.searchPlaceholder}
          aria-label="Search products"
        />
      </div>
      <div className="locale-label text-right text-[0.74rem] font-semibold uppercase text-app-text-faint">
        {isPending ? copy.updating : `${resultCount} ${copy.foundSuffix}`}
        <div className="locale-compact mt-1 text-[0.68rem] text-app-text-muted">
          {copy.pressSlashToFocus}
        </div>
      </div>
    </label>
  );
}
