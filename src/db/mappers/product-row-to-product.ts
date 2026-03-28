import type { ProductRow } from "@/db/schema";
import {
  PRODUCT_CATEGORIES,
  type Product,
  type ProductBadge,
  type ProductCategory,
} from "@/types/product";

const VALID_CATEGORIES = new Set<ProductCategory>(
  PRODUCT_CATEGORIES.map((category) => category.value),
);

function parseProductCategory(value: string): ProductCategory {
  if (VALID_CATEGORIES.has(value as ProductCategory)) {
    return value as ProductCategory;
  }

  throw new Error(`Invalid product category in database: ${value}`);
}

function parseProductBadge(value: string | null): ProductBadge | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "new" || value === "hot" || value === "sale") {
    return value;
  }

  throw new Error(`Invalid product badge in database: ${value}`);
}

function parseCurrency(value: string): "USD" {
  if (value === "USD") {
    return value;
  }

  throw new Error(`Invalid product currency in database: ${value}`);
}

export function mapProductRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    titleKm: row.titleKm ?? undefined,
    category: parseProductCategory(row.category),
    categoryLabel: row.categoryLabel,
    categoryLabelKm: row.categoryLabelKm ?? undefined,
    useCase: row.useCase ?? undefined,
    useCaseKm: row.useCaseKm ?? undefined,
    description: row.description,
    descriptionKm: row.descriptionKm ?? undefined,
    imageUrl: row.imageUrl,
    price: row.price,
    oldPrice: row.oldPrice ?? null,
    badge: parseProductBadge(row.badge),
    tags: row.tags ?? [],
    currency: parseCurrency(row.currency),
    inStock: row.inStock,
    sortOrder: row.sortOrder ?? undefined,
    isActive: row.isActive,
    rating: row.rating ?? undefined,
    createdOrder: row.createdOrder ?? undefined,
  };
}
