import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductDetailClient } from "@/components/catalog/ProductDetailClient";
import { RelatedProducts } from "@/components/catalog/product-detail/RelatedProducts";
import { JsonLd } from "@/components/seo/json-ld";
import { getCachedCategories, getCachedProducts } from "@/lib/db/cached-products";
import { getUiText, localizeText } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale-server";
import { getActiveProducts, mapProductToPublicProduct } from "@/lib/public-products";
import {
  DEFAULT_OG_IMAGE,
  SITE_ALTERNATE_LOCALE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
  formatUsdForTitle,
  toMetaDescription,
} from "@/lib/seo";
import {
  breadcrumbJsonLd,
  buildProductDescription,
  productBreadcrumbs,
  productImageUrls,
  productJsonLd,
  productName,
  productPath,
} from "@/lib/structured-data";

import { getPublicProduct } from "./product-loader";

type Params = Promise<{ id: string }>;

const RELATED_LIMIT = 8;

async function getRelatedProducts(category: string, excludeId: string) {
  try {
    const { products } = await getCachedProducts({ category, page: 1, sort: "default" });
    return getActiveProducts(products)
      .filter((item) => item.id !== excludeId)
      .slice(0, RELATED_LIMIT)
      .map(mapProductToPublicProduct);
  } catch (error) {
    console.error("[product] failed to load related products", error);
    return [];
  }
}

/** Streams in after the main product content, so it never delays the buy box or gallery. */
async function RelatedProductsSection({
  category,
  excludeId,
  locale,
}: {
  category: string;
  excludeId: string;
  locale: Awaited<ReturnType<typeof getRequestLocale>>;
}) {
  const related = await getRelatedProducts(category, excludeId);
  return <RelatedProducts products={related} locale={locale} title={getUiText(locale).productPage.related} />;
}

function RelatedProductsFallback() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-6 lg:pb-10" aria-hidden="true">
      <div className="mb-3 h-5 w-40 animate-pulse rounded bg-[var(--app-surface-3)] motion-reduce:animate-none" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[22rem] w-[44%] max-w-[15rem] shrink-0 animate-pulse rounded-[1.4rem] border border-[var(--app-border)] bg-white motion-reduce:animate-none sm:w-56"
          />
        ))}
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getPublicProduct(id);

  // Same name/price/description as the JSON-LD and the Merchant feed (lib/structured-data).
  const name = productName(product);
  const title = `${name} - ${formatUsdForTitle(product.price)} | ${SITE_NAME}`;
  const description = toMetaDescription(buildProductDescription(product));
  const canonical = productPath(product);
  const productImage = productImageUrls(product)[0];
  const ogImage = productImage ? { url: productImage, alt: name } : DEFAULT_OG_IMAGE;

  return {
    // `absolute` skips the layout's "%s | ECOBright" template (already in the title).
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      // Child openGraph replaces the layout's, so repeat the site-level fields.
      type: "website",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      alternateLocale: [SITE_ALTERNATE_LOCALE],
      url: canonical,
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = await getPublicProduct(id);

  const [categories, locale] = await Promise.all([
    getCachedCategories().catch(() => []),
    getRequestLocale(),
  ]);

  const localizedProduct = {
    ...product,
    name: localizeText(locale, product.name, product.titleKm),
    categoryLabel:
      localizeText(locale, product.categoryLabel, product.categoryLabelKm) || product.categoryLabel,
    useCase: localizeText(locale, product.useCase ?? "", product.useCaseKm) || product.useCase,
    description:
      localizeText(locale, product.description, product.descriptionKm) || product.description,
  };

  const allCount = categories.reduce((sum, category) => sum + category.count, 0);
  const categoryChips = [{ id: "all", label: "All", count: allCount }, ...categories];

  return (
    <>
    <JsonLd data={[productJsonLd(product), breadcrumbJsonLd(productBreadcrumbs(product))]} />
    <ProductDetailClient
      product={localizedProduct}
      categories={categoryChips}
      pageUrl={`${SITE_URL}${productPath(product)}`}
      related={
        <Suspense fallback={<RelatedProductsFallback />}>
          <RelatedProductsSection category={product.category} excludeId={product.id} locale={locale} />
        </Suspense>
      }
    />
    </>
  );
}
