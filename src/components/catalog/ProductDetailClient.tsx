"use client";

import { useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { CheckCircle2, ShoppingCart, Star } from "lucide-react";

import {
  getEffectiveOldPrice,
  getEffectiveVariant,
  getProductImages,
  getRatingLabel,
} from "@/components/catalog/catalog-helpers";
import { ProductGallery, type GalleryImage } from "@/components/catalog/product-detail/ProductGallery";
import {
  DeliveryReturns,
  ProductCode,
  QuantityStepper,
  SpecsTable,
  buildSpecRows,
  sectionCardClass,
  sectionTitleClass,
} from "@/components/catalog/product-detail/ProductInfoSections";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SiteHeader, TelegramIcon } from "@/components/layout/site-header";
import { useLocale } from "@/components/locale/locale-provider";
import { buildCartLineId } from "@/lib/cart-storage";
import { productEventParams, track } from "@/lib/analytics";
import { buildTelegramProfileUrl } from "@/lib/checkout";
import { TELEGRAM_CHECKOUT_USERNAME } from "@/lib/constants";
import { getUiText } from "@/lib/i18n";
import {
  getDisplayProductImage,
  getDisplayProductPrice,
  type PublicProduct,
  type PublicProductVariant,
} from "@/lib/public-products";
import type { ProductCategory as CatalogCategory } from "@/lib/types";
import { useCartStore } from "@/store/cart-store";
import type { ProductCategory } from "@/types/product";

const PLACEHOLDER_IMAGE = "/ecobright-logo.jpeg";
const PLACEHOLDER_DESCRIPTION = [/seed product/i, /variant testing/i, /test product/i, /placeholder/i, /demo data/i];

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

/** Same photo can arrive as variant image, image list and main image with different query strings. */
function imageKey(url: string) {
  try {
    const parsed = new URL(url, "https://ecobright.store");
    return decodeURIComponent(`${parsed.host}${parsed.pathname}`).toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function buildGalleryImages(
  product: PublicProduct,
  displayName: string,
  variant: PublicProductVariant | null,
  photoLabel: (index: number, total: number) => string,
): GalleryImage[] {
  const candidates = [
    variant?.imageUrl,
    ...getProductImages(product),
    ...product.variants.map((item) => item.imageUrl),
    getDisplayProductImage(product, product.variants),
  ].filter((src): src is string => Boolean(src));

  const seen = new Set<string>();
  let unique = candidates.filter((src) => {
    const key = imageKey(src);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // The shop logo is only a fallback; drop it when real photos exist.
  if (unique.length > 1) unique = unique.filter((src) => src !== PLACEHOLDER_IMAGE);

  return unique.map((src, index) => {
    const variantForImage = product.variants.find((item) => item.imageUrl && imageKey(item.imageUrl) === imageKey(src));
    const name = variantForImage ? `${displayName} (${variantForImage.label})` : displayName;
    return { src, alt: `${name} — ${photoLabel(index + 1, unique.length)}` };
  });
}

function buildTelegramOrderMessage(params: {
  name: string;
  code: string;
  variantLabel: string | null;
  quantity: number;
  unitPrice: number;
  currency: string;
  pageUrl: string;
}) {
  const { name, code, variantLabel, quantity, unitPrice, currency, pageUrl } = params;
  const lines = [
    "សួស្តី! ខ្ញុំចង់បញ្ជាទិញ:",
    `- ផលិតផល: ${name}`,
    `- លេខកូដ: ${code}`,
  ];
  if (variantLabel) lines.push(`- ជម្រើស: ${variantLabel}`);
  lines.push(`- ចំនួន: ${quantity}`);
  lines.push(
    quantity > 1
      ? `- តម្លៃ: ${formatCurrency(unitPrice, currency)} x ${quantity} = ${formatCurrency(unitPrice * quantity, currency)}`
      : `- តម្លៃ: ${formatCurrency(unitPrice, currency)}`,
  );
  lines.push(`- តំណ: ${pageUrl}`);
  lines.push("", "តើនៅមានស្តុកទេ?");
  return lines.join("\n");
}

function toCartItemDraft(
  product: PublicProduct,
  imageUrl: string | null,
  price: number,
  variant?: PublicProductVariant | null,
) {
  return {
    lineId: buildCartLineId({ productId: product.id, variantId: variant?.id ?? null }),
    id: variant?.id ?? product.id,
    productId: product.id,
    variantId: variant?.id ?? null,
    title: product.title,
    titleKm: product.titleKm ?? undefined,
    variantTitle: variant?.label ?? null,
    optionLabel: variant?.value ?? variant?.label ?? null,
    optionPrice: variant?.price ?? null,
    category: product.category as ProductCategory,
    categoryLabel: product.categoryLabel,
    categoryLabelKm: product.categoryLabelKm ?? undefined,
    imageUrl,
    price,
  };
}

export function ProductDetailClient({
  product,
  categories,
  pageUrl,
  related,
}: {
  product: PublicProduct;
  categories?: CatalogCategory[];
  /** Canonical absolute URL, included in the Telegram order message. */
  pageUrl: string;
  /** Server-rendered "Related products" row. */
  related?: ReactNode;
}) {
  const { locale } = useLocale();
  const ui = getUiText(locale);
  const copy = ui.productPage;
  const siteCopy = ui.site;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    getEffectiveVariant(product)?.id ?? null,
  );
  const variant = useMemo(() => getEffectiveVariant(product, selectedVariantId), [product, selectedVariantId]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showVariantWarning, setShowVariantWarning] = useState(false);
  const variantSelectorRef = useRef<HTMLDivElement | null>(null);

  const addItem = useCartStore((state) => state.addItem);
  const updateQty = useCartStore((state) => state.updateQty);

  const displayName = product.name;
  const description = product.description?.trim();
  const showDescription = Boolean(description) && !PLACEHOLDER_DESCRIPTION.some((re) => re.test(description));

  const price = variant?.price ?? getDisplayProductPrice(product, product.variants);
  const oldPrice = getEffectiveOldPrice(product, variant);
  const available = variant?.available ?? product.available;
  const ratingLabel = getRatingLabel(product.rating);
  const needsVariantSelection = product.variants.length > 0 && !variant;

  const images = useMemo(
    () => buildGalleryImages(product, displayName, variant, copy.photo),
    [product, displayName, variant, copy.photo],
  );
  const specRows = buildSpecRows(product, locale, copy);
  const warranty =
    locale === "km"
      ? product.specs.warrantyKm ?? product.specs.warranty
      : product.specs.warranty ?? product.specs.warrantyKm;

  const telegramHref = buildTelegramProfileUrl(
    TELEGRAM_CHECKOUT_USERNAME,
    buildTelegramOrderMessage({
      name: displayName,
      code: product.id,
      variantLabel: variant?.label ?? null,
      quantity,
      unitPrice: price,
      currency: product.currency,
      pageUrl,
    }),
  );

  function highlightVariantSelector() {
    variantSelectorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setShowVariantWarning(true);
    window.setTimeout(() => setShowVariantWarning(false), 2200);
  }

  function eventParams(location: string) {
    return productEventParams({
      location,
      id: product.id,
      name: product.title,
      variant: variant?.label ?? null,
      category: product.category,
      price,
      quantity,
      currency: product.currency,
    });
  }

  function handleOrderClick(event: MouseEvent<HTMLAnchorElement>, location: string) {
    if (needsVariantSelection) {
      event.preventDefault();
      highlightVariantSelector();
      return;
    }
    track("order_telegram_click", eventParams(location));
  }

  function handleAddToCart() {
    if (needsVariantSelection) {
      highlightVariantSelector();
      return;
    }

    const draft = toCartItemDraft(product, variant?.imageUrl ?? images[0]?.src ?? null, price, variant);
    const previousQty = useCartStore.getState().items.find((item) => item.lineId === draft.lineId)?.qty ?? 0;
    addItem(draft); // adds one
    if (quantity > 1) updateQty(draft.lineId, previousQty + quantity);
    track("add_to_cart", eventParams("buy_box"));

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  const orderButton = (className: string, location: string) => (
    <a
      href={telegramHref}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => handleOrderClick(event, location)}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[var(--app-primary)] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.99] ${className}`}
    >
      <TelegramIcon className="size-5" />
      {copy.orderTelegram}
    </a>
  );

  return (
    <div className="min-h-screen bg-[var(--app-bg)] pb-6 text-[var(--app-text)] md:pb-12">
      <SiteHeader categories={categories} activeCategory={product.category} />

      <div className="mx-auto w-full max-w-7xl px-4 pt-3 lg:pt-5">
        <Breadcrumbs
          label={siteCopy.breadcrumb}
          items={[
            { label: siteCopy.home, href: "/products" },
            { label: product.categoryLabel, href: `/products?category=${encodeURIComponent(product.category)}` },
            { label: displayName },
          ]}
        />
      </div>

      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-4 lg:grid-cols-12 lg:gap-6 lg:py-6">
        {/* Gallery */}
        <section className="min-w-0 lg:col-span-7">
          <ProductGallery
            images={images}
            selectedSrc={variant?.imageUrl ?? null}
            title={displayName}
            copy={copy}
          />
        </section>

        {/* Buy box + delivery (right column on desktop, directly under the gallery on mobile) */}
        <div className="min-w-0 space-y-5 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:self-start lg:sticky lg:top-36">
          <section className={`${sectionCardClass} space-y-5`} aria-label={copy.orderTelegram}>
            <div className="flex flex-wrap items-center gap-2">
              {product.badge ? (
                <span className="rounded-full bg-[var(--app-accent)] px-3 py-0.5 text-xs font-semibold text-[var(--app-text)]">
                  {product.badge}
                </span>
              ) : null}
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                  available
                    ? "bg-[var(--app-primary-soft)] text-[var(--app-primary-hover)]"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {available ? copy.available : copy.contactForAvailability}
              </span>
              {ratingLabel ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  {ratingLabel}
                </span>
              ) : null}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--app-text)] sm:text-3xl">{displayName}</h1>
              {product.useCase ? (
                <p className="text-sm leading-relaxed text-[var(--app-text-soft)]">{product.useCase}</p>
              ) : null}
              <ProductCode code={product.id} copy={copy} />
            </div>

            <div className="flex items-baseline gap-3 border-y border-[var(--app-border)] py-4">
              <span className="text-3xl font-bold tracking-tight text-[var(--app-primary)]">
                {formatCurrency(price, product.currency)}
              </span>
              {oldPrice && oldPrice > price ? (
                <span className="text-base text-[var(--app-text-faint)] line-through">
                  {formatCurrency(oldPrice, product.currency)}
                </span>
              ) : null}
            </div>

            {product.variants.length > 0 ? (
              <div className="space-y-2">
                <span className="locale-label text-xs font-bold uppercase text-[var(--app-text-muted)]">
                  {copy.chooseOption}
                </span>
                <div ref={variantSelectorRef} className="grid grid-cols-2 gap-2">
                  {product.variants.map((item) => {
                    const isActive = item.id === variant?.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedVariantId(item.id)}
                        aria-pressed={isActive}
                        className={`flex min-w-0 flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                          isActive
                            ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]/40 ring-1 ring-[var(--app-primary)]"
                            : "border-[var(--app-border)] bg-white hover:bg-[var(--app-surface)]"
                        }`}
                      >
                        <span className="text-sm font-semibold break-words text-[var(--app-text)]">{item.label}</span>
                        <span className="mt-2 flex w-full flex-wrap items-baseline justify-between gap-1">
                          <span className="text-sm font-bold text-[var(--app-primary)]">
                            {typeof item.price === "number" ? formatCurrency(item.price, product.currency) : "—"}
                          </span>
                          {!item.available ? (
                            <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                              {copy.outOfStock}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {showVariantWarning ? (
                  <div role="alert" className="rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                    {copy.chooseOptionWarning}
                  </div>
                ) : null}
              </div>
            ) : null}

            <QuantityStepper value={quantity} onChange={setQuantity} copy={copy} />

            <div className="flex flex-col gap-2">
              {orderButton("h-12 w-full", "buy_box")}
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--app-border)] bg-white text-sm font-semibold text-[var(--app-text-soft)] transition-all hover:bg-[var(--app-surface)] active:scale-[0.99]"
              >
                {added ? (
                  <>
                    <CheckCircle2 className="size-4 text-[var(--app-primary)]" />
                    {copy.addedToCart}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="size-4 text-[var(--app-primary)]" />
                    {copy.addToCart}
                  </>
                )}
              </button>
            </div>
          </section>

          <DeliveryReturns locale={locale} copy={copy} warranty={warranty} />
        </div>

        {/* Description + specs */}
        <section className={`${sectionCardClass} min-w-0 space-y-6 lg:col-span-7 lg:col-start-1`}>
          <div className="space-y-3">
            <h2 className={sectionTitleClass}>{copy.description}</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--app-text-soft)]">
              {showDescription ? description : copy.noDescription}
            </p>
            {product.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-[var(--app-border)]/30 bg-[var(--app-surface)] px-2.5 py-1 text-xs text-[var(--app-text-soft)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <SpecsTable rows={specRows} copy={copy} />
        </section>
      </main>

      {related}

      {/* Mobile sticky order bar */}
      <div className="hide-on-print fixed inset-x-0 bottom-0 z-50 border-t border-[var(--app-border)] bg-white/95 p-3 shadow-lg backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 shrink-0">
            <div className="text-lg font-bold leading-tight text-[var(--app-primary)]">
              {formatCurrency(price * quantity, product.currency)}
            </div>
            {quantity > 1 ? (
              <div className="text-[11px] text-[var(--app-text-muted)]">
                {formatCurrency(price, product.currency)} × {quantity}
              </div>
            ) : null}
          </div>
          {orderButton("h-12 min-w-0 flex-1", "sticky_bar")}
        </div>
      </div>
    </div>
  );
}
