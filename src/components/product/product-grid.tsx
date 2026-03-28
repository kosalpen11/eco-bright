"use client";

import { useLocale } from "@/components/locale/locale-provider";
import type { Product, ProductGroupSection as ProductGroupSectionType } from "@/types/product";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { getUiText } from "@/lib/i18n";
import { ProductGroupSection } from "@/components/product/product-group-section";

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
  const { locale } = useLocale();
  const copy = getUiText(locale).storefront;

  if (!sections.length) {
    return (
      <EmptyState
        title={copy.noProductsFound}
        description={copy.noProductsDescription}
        action={
          <Button variant="outline" onClick={onResetFilters}>
            {copy.resetCatalogView}
          </Button>
        }
      />
    );
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
