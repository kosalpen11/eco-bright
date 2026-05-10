import type { Locale } from "@/lib/locale";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/catalog/ProductCard";

export function ProductGrid({ products, locale }: { products: Product[]; locale: Locale }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}
