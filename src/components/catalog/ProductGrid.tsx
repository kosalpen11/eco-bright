import type { Locale } from "@/lib/locale";
import type { PublicProduct } from "@/lib/public-products";
import { ProductCard } from "@/components/catalog/ProductCard";
import { EmptyState } from "@/components/common/empty-state";

export function ProductGrid({
  products,
  locale,
}: {
  products: PublicProduct[];
  locale: Locale;
}) {
  if (!products.length) {
    return (
      <EmptyState
        title="No products found"
        description="Try a different keyword, category, or price range."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}
