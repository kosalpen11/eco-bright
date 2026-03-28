"use client";

import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import { useLocale } from "@/components/locale/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/common/product-image";
import { formatCurrency } from "@/lib/currency";
import {
  getBadgeLabel,
  getProductCategoryLabel,
  getProductDescription,
  getProductTitle,
  getProductUseCase,
  getUiText,
} from "@/lib/i18n";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function getBadgeTone(product: Product) {
  if (product.badge === "new") {
    return "new";
  }

  if (product.badge === "sale") {
    return "sale";
  }

  return "hot";
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { locale } = useLocale();
  const copy = getUiText(locale).product;
  const title = getProductTitle(product, locale);
  const categoryLabel = getProductCategoryLabel(product, locale);
  const description = getProductDescription(product, locale);
  const useCase = getProductUseCase(product, locale);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-app-border bg-[linear-gradient(180deg,var(--app-card),var(--app-surface))] shadow-[var(--app-shadow-card)] transition duration-300 hover:-translate-y-1 hover:border-app-border-strong hover:bg-app-card-hover hover:shadow-[var(--app-shadow-panel)]"
    >
      <div className="relative overflow-hidden border-b border-app-border bg-[radial-gradient(circle_at_top,var(--app-primary-soft),transparent_62%)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)] opacity-70" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(0deg,rgba(5,8,22,0.14),transparent)] dark:opacity-100" />
        <ProductImage
          src={product.imageUrl}
          alt={title}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 320px"
          className="aspect-[1.02] rounded-none border-0 bg-transparent sm:aspect-[1.04] lg:aspect-[1.08]"
          imageClassName="object-contain p-6 transition duration-500 group-hover:scale-[1.03] lg:p-7"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.badge ? (
            <Badge tone={getBadgeTone(product)}>{getBadgeLabel(product.badge, locale)}</Badge>
          ) : null}
          {product.inStock ? <Badge tone="neutral">{copy.inStock}</Badge> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-5 lg:p-6">
        <div className="space-y-3">
          <div className="locale-label flex items-center justify-between gap-3 text-[0.78rem] font-semibold uppercase text-app-text-faint">
            <span className="min-w-0 rounded-full bg-app-surface-2 px-3 py-1.5 text-app-text-muted">
              {categoryLabel}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-app-accent bg-app-accent-soft px-2.5 py-1 text-app-accent">
              <Star className="size-3 fill-current" />
              {(product.rating ?? 4.7).toFixed(1)}
            </span>
          </div>
          <h3 className="text-lg font-semibold leading-7 text-app-text lg:text-[1.3rem] lg:leading-8">
            {title}
          </h3>
          <p className="locale-body min-h-[4.75rem] text-sm text-app-text-muted lg:min-h-[5.25rem]">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="locale-chip rounded-full border border-app-border bg-app-surface-2 px-3 py-1.5 text-[0.74rem] font-medium uppercase text-app-text-muted"
            >
              {tag}
            </span>
          ))}
          {useCase ? (
            <span className="locale-chip rounded-full border border-app-secondary bg-app-secondary-soft px-3 py-1.5 text-[0.74rem] font-semibold uppercase text-app-secondary">
              {useCase}
            </span>
          ) : null}
        </div>

        <div className="mt-auto space-y-4 rounded-[1.5rem] border border-app-border bg-[linear-gradient(180deg,var(--app-surface-2),var(--app-surface-3))] p-4">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="locale-display font-display text-[2rem] uppercase text-app-primary lg:text-[2.2rem]">
                {formatCurrency(product.price)}
              </div>
              {product.oldPrice ? (
                <div className="text-sm text-app-text-faint line-through">
                  {formatCurrency(product.oldPrice)}
                </div>
              ) : (
                <div className="locale-label inline-flex items-center gap-1 text-sm uppercase text-app-text-faint">
                  <Sparkles className="size-3 text-app-accent" />
                  {copy.readyToQuote}
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={() => onAddToCart(product)}
            className="w-full justify-center rounded-full px-6 py-3 text-center text-[0.95rem] leading-snug sm:whitespace-nowrap lg:min-h-14 lg:text-base"
          >
            {copy.addToCart}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
