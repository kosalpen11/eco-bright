"use client";

import { useLocale } from "@/components/locale/locale-provider";
import { formatItemCount } from "@/lib/i18n";
import type { Product, ProductGroupSection as ProductGroupSectionType } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";

interface ProductGroupSectionProps {
  section: ProductGroupSectionType;
  onAddToCart: (product: Product) => void;
}

export function ProductGroupSection({
  section,
  onAddToCart,
}: ProductGroupSectionProps) {
  const { locale } = useLocale();

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 border-b border-app-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h3 className="locale-display font-display text-[2rem] uppercase text-app-text">
            {section.title}
          </h3>
          <p className="text-sm text-app-text-muted">{section.description}</p>
        </div>
        <div className="locale-label text-sm font-semibold uppercase text-app-text-faint">
          {formatItemCount(section.items.length, locale)}
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {section.items.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
}
