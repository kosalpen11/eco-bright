"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
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
  const stockLabel = product.inStock ? copy.inStock : copy.outOfStock;
  const visibleTags = product.tags
    .filter((tag) => !tag.trim().toLowerCase().startsWith("pack:"))
    .slice(0, 2);

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
          sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 420px"
          className="aspect-[1.24] rounded-none border-0 bg-transparent sm:aspect-[1.16] lg:aspect-[1.08]"
          imageClassName="object-contain p-5 transition duration-500 group-hover:scale-[1.03] sm:p-6 lg:p-7"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.badge ? (
            <Badge tone={getBadgeTone(product)}>{getBadgeLabel(product.badge, locale)}</Badge>
          ) : null}
          <Badge tone={product.inStock ? "neutral" : "hot"}>{stockLabel}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5 xl:p-6">
        <div className="space-y-2.5">
          <div className="locale-label flex flex-wrap items-center gap-3 text-[0.76rem] font-semibold uppercase text-app-text-faint">
            <span className="min-w-0 rounded-full border border-app-border bg-app-surface-2 px-3 py-1.5 text-app-text-muted">
              {categoryLabel}
            </span>
          </div>
          <h3 className="text-[1.05rem] font-semibold leading-7 text-app-text sm:text-[1.15rem] lg:text-[1.28rem] lg:leading-8">
            {title}
          </h3>
          <p
            className="locale-body text-sm leading-6 text-app-text-muted"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        </div>

        {visibleTags.length ? (
          <div className="flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="locale-chip rounded-full border border-app-border bg-app-surface-2 px-3 py-1.5 text-[0.72rem] font-medium uppercase text-app-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto rounded-[1.5rem] border border-app-border bg-[linear-gradient(180deg,var(--app-surface-2),var(--app-surface-3))] p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <span className="min-w-0 flex-1">
                <div className="locale-display font-display text-[1.8rem] uppercase leading-none text-app-primary sm:text-[2rem] lg:text-[2.15rem]">
                  {formatCurrency(product.price)}
                </div>
                {product.oldPrice ? (
                  <div className="mt-1 text-sm text-app-text-faint line-through">
                    {formatCurrency(product.oldPrice)}
                  </div>
                ) : (
                  <div className="locale-label mt-1 inline-flex items-center gap-1 text-sm uppercase text-app-text-faint">
                    <Sparkles className="size-3 text-app-accent" />
                    {copy.readyToQuote}
                  </div>
                )}
              </span>

              <Button
                type="button"
                onClick={() => onAddToCart(product)}
                disabled={!product.inStock}
                className="w-full justify-center rounded-full px-6 py-3 text-center text-[0.95rem] leading-snug sm:min-w-[11rem] sm:w-auto sm:whitespace-nowrap lg:min-h-14 lg:text-base"
              >
                {product.inStock ? copy.quickAdd : copy.outOfStock}
                {product.inStock ? <ArrowRight className="size-4" /> : null}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-app-text-muted">
                {product.inStock ? copy.reviewInInvoice : copy.stockUnavailable}
              </p>
              {useCase ? (
                <span className="locale-chip rounded-full border border-app-secondary bg-app-secondary-soft px-3 py-1.5 text-[0.72rem] font-medium uppercase text-app-secondary">
                  {useCase}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
