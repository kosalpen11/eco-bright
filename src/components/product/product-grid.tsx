"use client";

import type { Product, ProductGroupSection as ProductGroupSectionType } from "@/types/product";
import { ProductGroupSection } from "@/components/product/product-group-section";
import { ProductEmptyState } from "@/components/product/product-empty-state";

interface ProductGridProps {
  sections: ProductGroupSectionType[];
  onAddToCart: (product: Product) => void;
  onResetFilters: () => void;
}

export function ProductGrid({
  sections,
  onAddToCart,
  onResetFilters,
}: ProductGridProps) {
  if (!sections.length) {
    return <ProductEmptyState onReset={onResetFilters} />;
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <ProductGroupSection
          key={section.id}
          section={section}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
