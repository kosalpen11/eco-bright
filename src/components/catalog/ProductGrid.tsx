import Link from "next/link";

import { getUiText } from "@/lib/i18n";
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
        title={getUiText(locale).states.noProductsTitle}
        description={getUiText(locale).states.noProductsBody}
        action={
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--app-primary-hover)]"
          >
            {getUiText(locale).states.clearFilters}
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} locale={locale} eager={index < 2} />
      ))}
    </div>
  );
}
