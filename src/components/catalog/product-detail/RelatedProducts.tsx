import { ProductCard } from "@/components/catalog/ProductCard";
import type { Locale } from "@/lib/locale";
import type { PublicProduct } from "@/lib/public-products";

/** Horizontal, swipeable row of products from the same category. */
export function RelatedProducts({
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
    <section aria-labelledby="related-products-title" className="mx-auto w-full max-w-7xl px-4 pb-6 lg:pb-10">
      <h2 id="related-products-title" className="locale-label mb-3 text-sm font-bold uppercase text-[var(--app-text)]">
        {title}
      </h2>
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <li key={product.id} className="w-[44%] max-w-[15rem] shrink-0 snap-start sm:w-56">
            <ProductCard product={product} locale={locale} />
          </li>
        ))}
      </ul>
    </section>
  );
}
