"use client";

import { useLocale } from "@/components/locale/locale-provider";
import { getGroupModeLabel, getSortModeLabel, getUiText } from "@/lib/i18n";
import { PRODUCT_GROUP_MODES, PRODUCT_SORT_MODES } from "@/types/product";
import type { ProductGroupMode, ProductSortMode } from "@/types/product";

interface ProductSortProps {
  groupMode: ProductGroupMode;
  sortMode: ProductSortMode;
  onGroupModeChange: (mode: ProductGroupMode) => void;
  onSortModeChange: (mode: ProductSortMode) => void;
}

function ControlLabel({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <label className="grid-fade flex min-h-14 flex-1 items-center justify-between gap-4 rounded-[1.5rem] border border-app-border bg-app-surface px-4 py-3">
      <span className="locale-label text-[0.74rem] font-semibold uppercase text-app-text-faint">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-right text-sm font-semibold text-app-text outline-none"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-app-surface-2">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ProductSort({
  groupMode,
  sortMode,
  onGroupModeChange,
  onSortModeChange,
}: ProductSortProps) {
  const { locale } = useLocale();
  const copy = getUiText(locale).storefront;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <ControlLabel
        label={copy.groupBy}
        value={groupMode}
        options={PRODUCT_GROUP_MODES.map((option) => ({
          value: option.value,
          label: getGroupModeLabel(option.value, locale),
        }))}
        onChange={(value) => onGroupModeChange(value as ProductGroupMode)}
      />
      <ControlLabel
        label={copy.sortBy}
        value={sortMode}
        options={PRODUCT_SORT_MODES.map((option) => ({
          value: option.value,
          label: getSortModeLabel(option.value, locale),
        }))}
        onChange={(value) => onSortModeChange(value as ProductSortMode)}
      />
    </div>
  );
}
