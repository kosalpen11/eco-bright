import { Sparkles } from "lucide-react";

import { ProductCard } from "@/components/catalog/ProductCard";
import type { Locale } from "@/lib/locale";
import type { PublicProduct } from "@/lib/public-products";

/** Hand-picked "ផលិតផលណែនាំ" row (products.featured_rank). Swipeable on mobile. */
export function RecommendedProducts({
  products,
  locale,
  title,
}: {
  products: PublicProduct[];
  locale: Locale;
  title: string;
}) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="recommended-products-title" className="min-w-0">
      <h2
        id="recommended-products-title"
        className="locale-label mb-3 flex items-center gap-2 text-sm font-bold uppercase text-[var(--app-text)]"
      >
        <Sparkles className="size-4 text-[var(--app-accent-text)]" aria-hidden="true" />
        {title}
      </h2>
      <ul className="-mx-3 flex snap-x snap-mandatory scroll-px-3 gap-3 overflow-x-auto px-3 pb-2 [scrollbar-width:none] sm:-mx-4 sm:scroll-px-4 sm:px-4 [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <li key={product.id} className="w-[44%] max-w-[15rem] shrink-0 snap-start sm:w-56">
            <ProductCard product={product} locale={locale} analyticsLocation="recommended_row" />
          </li>
        ))}
      </ul>
    </section>
  );
}
