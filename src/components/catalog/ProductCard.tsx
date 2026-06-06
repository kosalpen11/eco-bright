import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { getEffectiveOldPrice, getRatingLabel, optimizeImageUrl } from "@/components/catalog/catalog-helpers";
import type { Locale } from "@/lib/locale";
import { localizeText } from "@/lib/i18n";
import {
  getDisplayProductImage,
  getDisplayProductPrice,
  getPublicAvailabilityText,
  type PublicProduct,
} from "@/lib/public-products";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function ProductCard({ product, locale }: { product: PublicProduct; locale: Locale }) {
  const displayName = localizeText(locale, product.name, product.titleKm);
  const image = getDisplayProductImage(product, product.variants);
  const price = getDisplayProductPrice(product, product.variants);
  const oldPrice = getEffectiveOldPrice(product, product.variants[0] ?? null);
  const ratingLabel = getRatingLabel(product.rating);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-[var(--app-border)] bg-white shadow-[var(--app-shadow-card)]">
      <Link href={`/products/${product.id}`} className="group block">
        <div className="relative aspect-[0.92] overflow-hidden bg-[var(--app-surface)]">
          {image ? (
            <Image
              src={optimizeImageUrl(image, 640)}
              alt={displayName}
              fill
              sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium text-[var(--app-text-faint)]">
              ECO BRIGHT
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            {product.badge ? (
              <span className="rounded-full bg-[var(--app-accent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--app-text)]">
                {product.badge}
              </span>
            ) : (
              <span />
            )}

            {ratingLabel ? (
              <span className="rounded-full border border-[var(--app-border)] bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--app-text-soft)]">
                {ratingLabel}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--app-text-muted)]">
          {product.categoryLabel}
        </div>

        <Link
          href={`/products/${product.id}`}
          className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-5 text-[var(--app-text)]"
        >
          {displayName}
        </Link>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <div className="text-base font-bold text-[var(--app-primary)] sm:text-lg">
              {product.variants.length > 0
                ? `From ${formatCurrency(price, product.currency)}`
                : formatCurrency(price, product.currency)}
            </div>
            {oldPrice && oldPrice > price ? (
              <div className="text-xs text-[var(--app-text-faint)] line-through">
                {formatCurrency(oldPrice, product.currency)}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-2 text-xs font-medium text-[var(--app-text-muted)]">
          {getPublicAvailabilityText(product.available)}
        </div>

        <div className="mt-auto pt-4">
          <AddToCartButton
            product={product}
            imageUrl={image}
            price={price}
            className="inline-flex h-10 w-full items-center justify-center rounded-full bg-[var(--app-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--app-primary-hover)]"
          />
        </div>
      </div>
    </div>
  );
}
