import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { CardOrderLink } from "@/components/catalog/CardOrderLink";
import { TelegramIcon } from "@/components/layout/site-header";
import { getProductDiscount, getRatingLabel, optimizeImageUrl } from "@/components/catalog/catalog-helpers";
import type { Locale } from "@/lib/locale";
import { getUiText, localizeText } from "@/lib/i18n";
import { buildProductOrderHref, formatPriceRange, formatUsd } from "@/lib/product-order-link";
import { getDisplayProductImage, type PublicProduct } from "@/lib/public-products";

export function ProductCard({
  product,
  locale,
  eager = false,
  analyticsLocation,
}: {
  product: PublicProduct;
  locale: Locale;
  /** First cards in the grid: load immediately at high priority (possible LCP). */
  eager?: boolean;
  /** Passed to the Telegram click event (defaults to "product_card"). */
  analyticsLocation?: string;
}) {
  const displayName = localizeText(locale, product.name, product.titleKm);
  const image = getDisplayProductImage(product, product.variants);
  const price = product.price;
  const priceText = formatPriceRange(product.price, product.priceMax, product.currency);
  const discount = getProductDiscount(product);
  const ratingLabel = getRatingLabel(product.rating);
  const copy = getUiText(locale).productPage;
  const href = `/products/${encodeURIComponent(product.slug)}`;
  const orderHref = buildProductOrderHref({ name: displayName, code: product.id, priceText, slug: product.slug });

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-[var(--app-border)] bg-white shadow-[var(--app-shadow-card)]">
      <Link href={href} className="group block">
        <div className="relative aspect-[0.92] overflow-hidden bg-[var(--app-surface)]">
          {image ? (
            <Image
              src={optimizeImageUrl(image, 640)}
              alt={displayName}
              fill
              sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 240px"
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium text-[var(--app-text-faint)]">
              ECO BRIGHT
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <div className="flex flex-col items-start gap-1">
              {discount ? (
                <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white">
                  -{discount.percent}%
                </span>
              ) : null}
              {product.badge ? (
                <span className="rounded-full bg-[var(--app-accent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--app-text)]">
                  {product.badge}
                </span>
              ) : null}
            </div>

            {ratingLabel ? (
              <span className="rounded-full border border-[var(--app-border)] bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--app-text-soft)]">
                {ratingLabel}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="locale-label text-[11px] font-semibold uppercase text-[var(--app-text-muted)]">
          {localizeText(locale, product.categoryLabel, product.categoryLabelKm)}
        </div>

        <Link
          href={href}
          className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-5 text-[var(--app-text)]"
        >
          {displayName}
        </Link>

        <div className="mt-3">
          {/* Option range, e.g. "$8.75 – $65"; a single price when there is no range. */}
          {/* On sale: discounted price in red with the original price struck through beside it. */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span
              className={`text-base font-bold leading-tight sm:text-lg ${
                discount ? "text-red-600" : "text-[var(--app-primary)]"
              }`}
            >
              {priceText}
            </span>
            {discount ? (
              <s className="text-sm font-medium text-[var(--app-text-muted)]">
                {formatUsd(discount.oldPrice, product.currency)}
              </s>
            ) : null}
          </div>
        </div>

        <div className="mt-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              product.available
                ? "bg-[var(--app-primary-soft)] text-[var(--app-primary-hover)]"
                : "bg-amber-50 text-amber-800"
            }`}
          >
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${product.available ? "bg-[var(--app-primary)]" : "bg-amber-600"}`}
            />
            {product.available ? copy.available : copy.contactForAvailability}
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-4">
          <CardOrderLink
            href={orderHref}
            location={analyticsLocation}
            product={{ id: product.id, name: product.title, category: product.category, price, currency: product.currency }}
            className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-[var(--app-primary)] px-3 text-center text-sm font-semibold leading-tight text-white transition hover:bg-[var(--app-primary-hover)]"
          >
            <TelegramIcon className="size-4 shrink-0" />
            {copy.orderTelegram}
          </CardOrderLink>
          <AddToCartButton
            product={product}
            imageUrl={image}
            price={price}
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--app-border)] bg-white px-4 text-sm font-semibold text-[var(--app-text-soft)] transition hover:bg-[var(--app-surface)]"
          />
        </div>
      </div>
    </div>
  );
}
