"use client";

import { useMemo, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeInfo,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Star,
  ShoppingCart,
  MessageSquare,
} from "lucide-react";

import { CopyProductButton } from "@/components/catalog/CopyProductButton";
import {
  formatAttributeValue,
  getAttributeEntries,
  getEffectiveOldPrice,
  getEffectiveVariant,
  getProductImages,
  getRatingLabel,
  getVariantAttributeEntries,
  optimizeImageUrl,
} from "@/components/catalog/catalog-helpers";
import { buildCartLineId } from "@/lib/cart-storage";
import { TELEGRAM_CHECKOUT_USERNAME, TELEGRAM_OWNER_URL } from "@/lib/constants";
import { buildTelegramProfileUrl } from "@/lib/checkout";
import {
  getDisplayProductImage,
  getDisplayProductPrice,
  getPublicAvailabilityText,
  type PublicProduct,
  type PublicProductVariant,
} from "@/lib/public-products";
import { useCartStore } from "@/store/cart-store";
import type { ProductCategory } from "@/types/product";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function buildProductTelegramMessage(
  product: PublicProduct,
  variant: PublicProductVariant | null,
  price: number,
) {
  const lines = [
    "សួស្តី! ខ្ញុំចង់ទិញ:",
    `- ផលិតផល: ${product.title}`,
  ];

  if (variant?.label) {
    lines.push(`- ជម្រើស: ${variant.label}`);
  }

  lines.push(`- តម្លៃ: ${formatCurrency(price, product.currency)}`);
  lines.push("");
  lines.push("តើនៅមានស្តុកទេ?");

  return lines.join("\n");
}

function buildDetailFacts(product: PublicProduct) {
  return [
    { label: "Product ID", value: product.id },
    { label: "Category", value: product.categoryLabel },
    { label: "Hole size", value: product.holeSize },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value?.trim()));
}

function buildAttributeGroups(product: PublicProduct) {
  return getAttributeEntries(product.attributes).map(([label, value]) => ({
    label,
    values: Array.isArray(value) ? value.map(String) : [formatAttributeValue(value)],
  }));
}

function hasMeaningfulDescription(value: string | null | undefined) {
  const normalized = value?.trim();
  if (!normalized || normalized.length < 24) return false;
  return ![
    /seed product/i,
    /variant testing/i,
    /test product/i,
    /placeholder/i,
    /demo data/i,
  ].some((pattern) => pattern.test(normalized));
}

function toCartItemDraft(
  product: PublicProduct,
  imageUrl: string | null,
  price: number,
  variant?: PublicProductVariant | null,
) {
  return {
    lineId: buildCartLineId({
      productId: product.id,
      variantId: variant?.id ?? null,
    }),
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

export function ProductDetailClient({ product }: { product: PublicProduct }) {
  const activeVariants = product.variants;
  const initialVariant = getEffectiveVariant(product);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    initialVariant?.id ?? null,
  );
  
  const variant = useMemo(
    () => getEffectiveVariant(product, selectedVariantId),
    [product, selectedVariantId]
  );

  const baseImage = getDisplayProductImage(product, activeVariants);
  const baseImages = getProductImages(product);
  const images = useMemo(() => {
    return Array.from(
      new Set([variant?.imageUrl, ...baseImages, baseImage].filter((v): v is string => Boolean(v)))
    );
  }, [variant?.imageUrl, baseImages, baseImage]);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const activeImage = selectedImage ?? images[0] ?? null;
  const variantSelectorRef = useRef<HTMLDivElement | null>(null);
  const [showVariantWarning, setShowVariantWarning] = useState(false);

  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const carouselRef = useRef<HTMLDivElement>(null);

  const displayName = product.name;
  const description = hasMeaningfulDescription(product.description) ? product.description : null;

  const price = variant?.price ?? getDisplayProductPrice(product, activeVariants);
  const oldPrice = getEffectiveOldPrice(product, variant);
  const available = variant?.available ?? product.available;
  const ratingLabel = getRatingLabel(product.rating);
  const attributeGroups = buildAttributeGroups(product);
  const detailFacts = buildDetailFacts(product);

  const telegramMessage = useMemo(
    () => buildProductTelegramMessage(product, variant, price),
    [product, variant, price],
  );

  const activeImageIndex = Math.max(0, images.indexOf(activeImage));

  function handleImageSelect(image: string, index: number) {
    setSelectedImage(image);
    if (carouselRef.current) {
      const container = carouselRef.current;
      const slideWidth = container.clientWidth;
      container.scrollTo({ left: slideWidth * index, behavior: "smooth" });
    }
  }

  function handleNavigateImage(direction: "prev" | "next") {
    let nextIndex = direction === "next" ? activeImageIndex + 1 : activeImageIndex - 1;
    if (nextIndex < 0) nextIndex = images.length - 1;
    if (nextIndex >= images.length) nextIndex = 0;
    handleImageSelect(images[nextIndex], nextIndex);
  }

  function handleVariantSelect(variantId: string) {
    setSelectedVariantId(variantId);
    const nextVariant = getEffectiveVariant(product, variantId);
    if (nextVariant?.imageUrl) {
      const imgIndex = images.indexOf(nextVariant.imageUrl);
      setSelectedImage(nextVariant.imageUrl);
      if (imgIndex !== -1 && carouselRef.current) {
        carouselRef.current.scrollTo({ left: carouselRef.current.clientWidth * imgIndex, behavior: "smooth" });
      }
    }
  }

  const needsVariantSelection = activeVariants.length > 0 && !variant;

  function highlightVariantSelector() {
    if (variantSelectorRef.current) {
      variantSelectorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setShowVariantWarning(true);
      window.setTimeout(() => setShowVariantWarning(false), 2200);
    }
  }

  function handleAddToInquiry() {
    if (needsVariantSelection) {
      highlightVariantSelector();
      return;
    }

    addItem(toCartItemDraft(product, activeImage, price, variant));
    openCart();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  function handleAddAndOpenTelegram() {
    if (needsVariantSelection) {
      highlightVariantSelector();
      return;
    }

    try {
      addItem(toCartItemDraft(product, activeImage, price, variant));
    } catch (err) {
      // ignore add failure; still open telegram
    }

    // show added feedback briefly
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);

    const url = buildTelegramProfileUrl(TELEGRAM_CHECKOUT_USERNAME, telegramMessage);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] pb-28 text-[var(--app-text)] md:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--app-border)] bg-white/94 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/products"
              className="inline-flex size-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-white text-[var(--app-text-soft)] hover:bg-[var(--app-surface)] transition-colors"
              aria-label="Back to products"
            >
              <ChevronLeft className="size-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-[var(--app-text)]">{displayName}</h1>
              <p className="truncate text-xs text-[var(--app-text-muted)]">{product.categoryLabel}</p>
            </div>
          </div>

          <a
            href={TELEGRAM_OWNER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex size-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-white text-[var(--app-primary)] hover:bg-[var(--app-surface)] transition-colors"
            aria-label="Contact Channel"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
              <path d="M9.993 15.544 9.83 19.1c.35 0 .503-.15.686-.33l1.645-1.57 3.41 2.496c.625.345 1.067.163 1.223-.577l2.216-10.39c.227-1.01-.37-1.404-.98-1.18L4.24 11.39c-.96.38-.946.925-.165 1.17l3.56 1.11 8.26-5.22c.39-.24.744-.11.452.13z" />
            </svg>
          </a>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-4 lg:grid-cols-12 lg:py-8">
        {/* Left Column: Images */}
        <section className="lg:col-span-7 space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--app-border)] bg-white shadow-sm group">
            {/* Main Carousel View */}
            <div 
              ref={carouselRef}
              className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {images.map((image, idx) => (
                <div
                  key={image}
                  className="relative h-[24rem] min-w-full snap-center bg-[var(--app-surface)] sm:h-[32rem] flex items-center justify-center"
                >
                  <Image
                    src={optimizeImageUrl(image, 1200)}
                    alt={`${displayName} view ${idx + 1}`}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 1023px) 100vw, 55vw"
                    className="object-contain p-4 sm:p-8"
                  />
                </div>
              ))}
            </div>

            {/* Desktop & Interactive Arrow UI Overlays */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => handleNavigateImage("prev")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-white/90 shadow-md backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity text-[var(--app-text)] hover:bg-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateImage("next")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-white/90 shadow-md backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity text-[var(--app-text)] hover:bg-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </button>
                {/* Index Counter Indicator */}
                <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white tracking-wide backdrop-blur-xs">
                  {activeImageIndex + 1} / {images.length}
                </div>
              </>
            )}

            {/* Micro Thumbnail Items */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-t border-[var(--app-border)] p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((image, idx) => {
                  const isActive = image === activeImage;
                  return (
                    <button
                      key={image}
                      type="button"
                      onClick={() => handleImageSelect(image, idx)}
                      className={`relative size-16 shrink-0 overflow-hidden rounded-xl border bg-[var(--app-surface)] transition-all ${
                        isActive ? "border-[var(--app-primary)] ring-2 ring-[var(--app-primary-soft)]" : "border-[var(--app-border)] hover:border-[var(--app-text-faint)]"
                      }`}
                    >
                      <Image
                        src={optimizeImageUrl(image, 240)}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Shopping and Info details */}
        <section className="lg:col-span-5 space-y-5">
          <div className="rounded-3xl border border-[var(--app-border)] bg-white p-5 shadow-sm sm:p-6 space-y-6">
            
            {/* Badges and tags top info container row */}
            <div className="flex flex-wrap items-center gap-2">
              {product.badge && (
                <span className="rounded-full bg-[var(--app-accent)] px-3 py-0.5 text-xs font-semibold text-[var(--app-text)]">
                  {product.badge}
                </span>
              )}
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                available ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "bg-neutral-100 text-neutral-500"
              }`}>
                {getPublicAvailabilityText(available)}
              </span>
              {ratingLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  {ratingLabel}
                </span>
              )}
            </div>

            {/* Title & Core Meta Description */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--app-text)] sm:text-3xl">
                {displayName}
              </h2>
              {product.useCase && (
                <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-soft)]">{product.useCase}</p>
              )}
            </div>

            {/* Display Pricing Row */}
            <div className="flex items-baseline gap-3 border-y border-[var(--app-border)] py-4">
              <span className="text-3xl font-bold text-[var(--app-primary)] tracking-tight">
                {formatCurrency(price, product.currency)}
              </span>
              {oldPrice && oldPrice > price ? (
                <span className="text-base text-[var(--app-text-faint)] line-through">
                  {formatCurrency(oldPrice, product.currency)}
                </span>
              ) : null}
            </div>

            {/* Options Selector - Re-engineered for structural clean layouts */}
            {activeVariants.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                  Choose Variant Option
                </label>
                <div ref={variantSelectorRef} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {activeVariants.map((item) => {
                    const isActive = item.id === variant?.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleVariantSelect(item.id)}
                        className={`flex flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                          isActive
                            ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]/40 ring-1 ring-[var(--app-primary)]"
                            : "border-[var(--app-border)] bg-white hover:bg-[var(--app-surface)]"
                        }`}
                      >
                        <span className="text-sm font-semibold text-[var(--app-text)]">{item.label}</span>
                        
                        <div className="mt-2 flex items-baseline justify-between gap-2 w-full">
                          <span className="text-sm font-bold text-[var(--app-primary)]">
                            {typeof item.price === "number" ? formatCurrency(item.price, product.currency) : "—"}
                          </span>
                          {!item.available && (
                            <span className="text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                              Out of stock
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {showVariantWarning && (
                  <div className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                    Please choose a variant option before continuing.
                  </div>
                )}
              </div>
            )}

            {/* Quick structural metadata and detail fields elements */}
            {detailFacts.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Quick Specifications</span>
                <div className="grid gap-2 grid-cols-2">
                  {detailFacts.map((item) => (
                    <div key={item.label} className="rounded-xl bg-[var(--app-surface)] px-3 py-2 border border-[var(--app-border)]/50">
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-[var(--app-text-muted)]">{item.label}</span>
                      <span className="mt-0.5 block text-sm font-semibold text-[var(--app-text-soft)] truncate">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Action Buttons (Inline on Desktop for higher conversions) */}
            <div className="hidden md:flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleAddToInquiry}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--app-primary)] text-sm font-semibold text-white shadow-sm hover:opacity-95 active:scale-[0.99] transition-all"
              >
                <ShoppingCart className="size-4" />
                {added ? "Item Added to Cart" : "Add to Cart"}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAddAndOpenTelegram}
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-[var(--app-border)] bg-white text-xs font-semibold text-[var(--app-text-soft)] hover:bg-[var(--app-surface)] transition-all"
                >
                  <MessageSquare className="size-3.5 text-sky-500" />
                  Telegram Order
                </button>
                <a
                  href={TELEGRAM_OWNER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-[var(--app-border)] bg-white text-xs font-semibold text-[var(--app-text-soft)] hover:bg-[var(--app-surface)] transition-all"
                >
                  Direct Support
                </a>
              </div>
            </div>

          </div>

          {/* Collateral Details Container Box */}
          <div className="rounded-3xl border border-[var(--app-border)] bg-white p-5 shadow-sm sm:p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--app-text)]">
              <BadgeInfo className="size-4 text-[var(--app-primary)]" />
              Product Overview
            </h3>

            {description ? (
              <p className="rounded-2xl bg-[var(--app-surface)] p-4 text-sm leading-relaxed text-[var(--app-text-soft)] whitespace-pre-line">
                {description}
              </p>
            ) : attributeGroups.length === 0 && detailFacts.length === 0 ? (
              <p className="rounded-2xl bg-[var(--app-surface)] p-4 text-sm text-[var(--app-text-muted)] italic">
                Contact us for full product details and custom recommended setups.
              </p>
            ) : null}

            {/* Object Structured Attributes List (Unified logic avoids double render lists) */}
            {attributeGroups.length > 0 && (
              <div className="space-y-1.5">
                {attributeGroups.map((group) => (
                  <div key={group.label} className="flex justify-between items-start py-2 border-b border-dashed border-[var(--app-border)] last:border-0 text-sm">
                    <span className="font-medium text-[var(--app-text-muted)]">{group.label}</span>
                    <span className="font-semibold text-[var(--app-text-soft)] text-right max-w-[65%]">
                      {group.values.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Product Tag Badge Rows */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-[var(--app-surface)] px-2.5 py-1 text-xs text-[var(--app-text-soft)] border border-[var(--app-border)]/30">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Copy Identifiers Panel Area */}
            <div className="flex items-center gap-2 pt-2">
              <CopyProductButton
                productId={product.id}
                productName={displayName}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-[var(--app-border)] bg-white px-4 text-xs font-semibold text-[var(--app-text-soft)] hover:bg-[var(--app-surface)] transition-colors"
              />
              <div className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--app-surface)] px-4 text-xs font-mono text-[var(--app-text-muted)] border border-[var(--app-border)]/40">
                <Copy className="size-3" />
                ID: {product.id}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Mobile CTA Drawer (Clean structural UI layout) */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--app-border)] bg-white/95 p-3 shadow-lg backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-12 gap-2">
          <button
            type="button"
            onClick={handleAddAndOpenTelegram}
            className="col-span-4 inline-flex h-12 items-center justify-center rounded-xl border border-[var(--app-border)] bg-white text-xs font-bold text-[var(--app-text-soft)] active:bg-[var(--app-surface)]"
          >
            Telegram
          </button>
          <button
            type="button"
            onClick={handleAddToInquiry}
            className="col-span-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] px-4 text-sm font-bold text-white active:opacity-90 shadow-sm"
          >
            {added ? (
              <span className="inline-flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="size-4" />
                Added to Cart
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <ShoppingCart className="size-4" />
                Add to Cart
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}