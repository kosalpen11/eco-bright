"use client";

import Image from "next/image";

import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
import type { PublicProduct, PublicProductVariant } from "@/lib/public-products";

export function VariantPickerModal({
  product,
  variants,
  imageUrl,
  onSelect,
  onClose,
}: {
  product: PublicProduct;
  variants: PublicProductVariant[];
  imageUrl: string | null;
  onSelect: (variant: PublicProductVariant) => void;
  onClose: () => void;
}) {
  const { locale } = useLocale();
  const ui = getUiText(locale);
  const copy = ui.catalogPage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div role="dialog" aria-modal="true" aria-labelledby="variant-picker-title" className="relative z-10 w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-[var(--app-surface)]">
              <Image src={imageUrl} alt={product.title} fill sizes="48px" className="object-cover" />
            </div>
          ) : null}
          <div>
            <div id="variant-picker-title" className="text-sm font-semibold">{copy.selectOption}</div>
            <div className="text-xs text-[var(--app-text-muted)]">{product.title}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v)}
              disabled={!v.available}
              className={`flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition ${
                v.available ? "hover:bg-[var(--app-surface)]" : "opacity-50"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{v.label}</span>
                {v.value ? <span className="text-xs text-[var(--app-text-muted)]">{v.value}</span> : null}
                {!v.available ? <span className="text-xs text-red-700">{ui.productPage.outOfStock}</span> : null}
              </div>
              <div className="text-sm font-semibold text-[var(--app-primary)]">
                {typeof v.price === "number" ? formatCurrency(v.price, product.currency) : "—"}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-full px-4 text-sm font-medium text-[var(--app-text-muted)] hover:bg-[var(--app-surface)]"
          >
            {copy.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VariantPickerModal;
