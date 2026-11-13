import { notFound } from "next/navigation";

import type { Product, ProductAttributeValue, ProductSpecs, ProductVariant } from "@/lib/types";

const FALLBACK_PRODUCT_IMAGE = "/ecobright-logo.jpeg";

export interface PublicProductVariant {
  id: string;
  label: string;
  value?: string | null;
  imageUrl: string | null;
  price: number | null;
  oldPrice: number | null;
  attributes: Record<string, ProductAttributeValue>;
  available: boolean;
}

export interface PublicProduct {
  id: string;
  /** URL segment for /products/{slug}; falls back to id. */
  slug: string;
  brand: string | null;
  title: string;
  titleKm: string | null;
  name: string;
  category: string;
  categoryLabel: string;
  categoryLabelKm: string | null;
  description: string;
  descriptionKm: string | null;
  price: number;
  /** Highest active option price; equals price when there is no range. */
  priceMax: number;
  oldPrice: number | null;
  badge: string | null;
  packQty: string | null;
  holeSize: string | null;
  useCase: string | null;
  useCaseKm: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  currency: string;
  available: boolean;
  rating: number | null;
  tags: string[];
  attributes: Record<string, ProductAttributeValue>;
  variants: PublicProductVariant[];
  specs: ProductSpecs;
}

const EMPTY_SPECS: ProductSpecs = {
  length: null,
  voltage: null,
  wattage: null,
  color: null,
  colorKm: null,
  warranty: null,
  warrantyKm: null,
};

function isAllowedImageUrl(url: string) {
  if (url.startsWith("/")) return true;
  if (!url.startsWith("http")) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function getVariantAvailability(variant: Pick<ProductVariant, "inStock" | "stockQty">) {
  if (typeof variant.inStock === "boolean") {
    return variant.inStock;
  }

  if (typeof variant.stockQty === "number") {
    return variant.stockQty > 0;
  }

  return false;
}

export function getActiveProducts(products: Product[]) {
  return products.filter((product) => product.isActive);
}

export function getActiveVariants(product: Pick<Product, "variants">) {
  return product.variants.filter((variant) => variant.isActive);
}

export function getPublicAvailabilityText(available: boolean) {
  return available ? "Available" : "Contact for availability";
}

export function getDisplayProductPrice(
  product: Pick<Product, "price">,
  activeVariants: Array<Pick<ProductVariant, "price">>,
) {
  return activeVariants.find((variant) => typeof variant.price === "number")?.price ?? product.price;
}

export function getDisplayProductImage(
  product: Pick<Product, "imageUrl" | "imageUrls">,
  activeVariants: Array<Pick<ProductVariant, "imageUrl">>,
) {
  const variantImage = activeVariants.find((variant) => variant.imageUrl)?.imageUrl ?? null;
  if (variantImage && isAllowedImageUrl(variantImage)) {
    return variantImage;
  }

  const productImages = product.imageUrls.filter(isAllowedImageUrl);
  const productImage = product.imageUrl && isAllowedImageUrl(product.imageUrl) ? product.imageUrl : null;

  return productImages[0] ?? productImage ?? FALLBACK_PRODUCT_IMAGE;
}

export function mapProductToPublicProduct(product: Product): PublicProduct {
  const activeVariants = getActiveVariants(product);
  const publicVariants: PublicProductVariant[] = activeVariants.map((variant) => ({
    id: variant.id,
    label: variant.label,
    value: variant.value ?? null,
    imageUrl: variant.imageUrl && isAllowedImageUrl(variant.imageUrl) ? variant.imageUrl : null,
    price: variant.price,
    oldPrice: variant.oldPrice,
    attributes: variant.attributes,
    available: getVariantAvailability(variant),
  }));
  const available =
    publicVariants.length > 0
      ? publicVariants.some((variant) => variant.available)
      : product.inStock || (typeof product.stockQty === "number" ? product.stockQty > 0 : false);

  const optionPrices = publicVariants
    .map((variant) => variant.price)
    .filter((value): value is number => typeof value === "number");
  const displayPrice = getDisplayProductPrice(product, publicVariants);
  const minPrice = optionPrices.length ? Math.min(...optionPrices) : displayPrice;

  return {
    id: product.id,
    slug: product.slug || product.id,
    brand: product.brand ?? null,
    title: product.title,
    titleKm: product.titleKm,
    name: product.name,
    category: product.category,
    categoryLabel: product.categoryLabel,
    categoryLabelKm: product.categoryLabelKm,
    description: product.description,
    descriptionKm: product.descriptionKm,
    price: minPrice,
    priceMax: optionPrices.length ? Math.max(...optionPrices) : minPrice,
    oldPrice: product.oldPrice,
    badge: product.badge,
    packQty: product.packQty,
    holeSize: product.holeSize,
    useCase: product.useCase,
    useCaseKm: product.useCaseKm,
    imageUrl: getDisplayProductImage(product, publicVariants),
    imageUrls:
      product.imageUrls.filter(isAllowedImageUrl).length > 0
        ? product.imageUrls.filter(isAllowedImageUrl)
        : product.imageUrl && isAllowedImageUrl(product.imageUrl)
          ? [product.imageUrl]
          : [FALLBACK_PRODUCT_IMAGE],
    currency: product.currency,
    available,
    rating: product.rating,
    tags: product.tags,
    attributes: product.attributes,
    variants: publicVariants,
    specs: product.specs ?? EMPTY_SPECS,
  };
}

export function getPublicProductOrNotFound(product: Product | null) {
  if (!product || !product.isActive) {
    notFound();
  }

  return mapProductToPublicProduct(product);
}
