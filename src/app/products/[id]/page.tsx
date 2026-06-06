import type { Metadata } from "next";

import { ProductDetailClient } from "@/components/catalog/ProductDetailClient";
import { getProductById } from "@/lib/db/products";
import { localizeText } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale-server";
import { getPublicProductOrNotFound } from "@/lib/public-products";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getPublicProductOrNotFound(await getProductById(id));

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = getPublicProductOrNotFound(await getProductById(id));

  const locale = await getRequestLocale();
  const localizedProduct = {
    ...product,
    name: localizeText(locale, product.name, product.titleKm),
    categoryLabel:
      localizeText(locale, product.categoryLabel, product.categoryLabelKm) || product.categoryLabel,
    useCase: localizeText(locale, product.useCase ?? "", product.useCaseKm) || product.useCase,
    description:
      localizeText(locale, product.description, product.descriptionKm) || product.description,
  };

  return <ProductDetailClient product={localizedProduct} />;
}
