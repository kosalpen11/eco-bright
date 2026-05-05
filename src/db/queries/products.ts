import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { migrationRowToProductInsert } from "@/db/mappers/migration-row-to-product";
import { mapProductRowToProduct } from "@/db/mappers/product-row-to-product";
import { slugify } from "@/lib/utils";
import { productsTable, type ProductInsert } from "@/db/schema";
import type { NormalizedMigrationRow } from "@/types/migration";
import type { Product } from "@/types/product";

function mapProductToInsert(product: Product): ProductInsert {
  return {
    id: product.id,
    brand: product.brand ?? "ecobright",
    title: product.title,
    titleKm: product.titleKm ?? null,
    category: product.category,
    categoryLabel: product.categoryLabel,
    categoryLabelKm: product.categoryLabelKm ?? null,
    useCase: product.useCase ?? null,
    useCaseKm: product.useCaseKm ?? null,
    description: product.description,
    descriptionKm: product.descriptionKm ?? null,
    imageUrl: product.imageUrl ?? null,
    imageUrls:
      product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls
        : product.imageUrl
          ? [product.imageUrl]
          : null,
    price: product.price,
    oldPrice: product.oldPrice ?? null,
    badge: product.badge ?? null,
    tags: product.tags,
    currency: product.currency,
    inStock: product.inStock,
    sortOrder: product.sortOrder ?? null,
    isActive: product.isActive,
    rating: product.rating ?? null,
    createdOrder: product.createdOrder ?? null,
    rawCategory: product.rawCategory ?? null,
    packQty: product.packQty ?? null,
    holeSize: product.holeSize ?? null,
    sourceSheet: product.sourceSheet ?? null,
    sourceBlock: product.sourceBlock ?? null,
    sourceRow: product.sourceRow ?? null,
    sourceSegment: product.sourceSegment ?? null,
    needsReview: product.needsReview ?? false,
    reviewFlags: product.reviewFlags ?? [],
    migrationBatchId: product.migrationBatchId ?? null,
    updatedAt: new Date(),
  };
}

export async function getActiveProducts(): Promise<Product[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isActive, true))
    .orderBy(
      sql`coalesce(${productsTable.sortOrder}, 2147483647)`,
      desc(sql`coalesce(${productsTable.createdOrder}, 0)`),
      asc(productsTable.title),
    );

  return rows.map(mapProductRowToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = getDb();
  const row = await db.query.productsTable.findFirst({
    where: eq(productsTable.id, id),
  });

  return row ? mapProductRowToProduct(row) : null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(productsTable)
    .where(inArray(productsTable.id, [...new Set(ids)]));

  return rows.map(mapProductRowToProduct);
}

function buildProductLookupCandidates(product: Product) {
  return new Set([
    product.id.toLowerCase(),
    slugify(product.title),
    slugify(`${product.title}-${product.id}`),
  ]);
}

export async function getProductByLookupKey(lookupKey: string): Promise<Product | null> {
  const normalizedLookupKey = lookupKey.trim().toLowerCase();

  if (!normalizedLookupKey) {
    return null;
  }

  const directMatch = await getProductById(lookupKey);
  if (directMatch) {
    return directMatch;
  }

  const products = await getActiveProducts();

  return (
    products.find((product) => buildProductLookupCandidates(product).has(normalizedLookupKey)) ??
    null
  );
}

export async function upsertProducts(products: Product[]) {
  if (products.length === 0) {
    return { count: 0 };
  }

  const db = getDb();

  await db
    .insert(productsTable)
    .values(products.map(mapProductToInsert))
    .onConflictDoUpdate({
      target: productsTable.id,
      set: {
        title: sql`excluded.title`,
        titleKm: sql`excluded.title_km`,
        category: sql`excluded.category`,
        categoryLabel: sql`excluded.category_label`,
        categoryLabelKm: sql`excluded.category_label_km`,
        useCase: sql`excluded.use_case`,
        useCaseKm: sql`excluded.use_case_km`,
        description: sql`excluded.description`,
        descriptionKm: sql`excluded.description_km`,
        imageUrl: sql`excluded.image_url`,
        imageUrls: sql`excluded.image_urls`,
        price: sql`excluded.price`,
        oldPrice: sql`excluded.old_price`,
        badge: sql`excluded.badge`,
        tags: sql`excluded.tags`,
        currency: sql`excluded.currency`,
        inStock: sql`excluded.in_stock`,
        sortOrder: sql`excluded.sort_order`,
        isActive: sql`excluded.is_active`,
        rating: sql`excluded.rating`,
        createdOrder: sql`excluded.created_order`,
        rawCategory: sql`excluded.raw_category`,
        packQty: sql`excluded.pack_qty`,
        holeSize: sql`excluded.hole_size`,
        sourceSheet: sql`excluded.source_sheet`,
        sourceBlock: sql`excluded.source_block`,
        sourceRow: sql`excluded.source_row`,
        sourceSegment: sql`excluded.source_segment`,
        needsReview: sql`excluded.needs_review`,
        reviewFlags: sql`excluded.review_flags`,
        migrationBatchId: sql`excluded.migration_batch_id`,
        updatedAt: sql`now()`,
      },
    });

  return { count: products.length };
}

export async function upsertNormalizedProducts(rows: NormalizedMigrationRow[]) {
  const readyRows = rows
    .filter((row) => row.reviewStatus !== "rejected")
    .map(migrationRowToProductInsert);

  if (readyRows.length === 0) {
    return { count: 0 };
  }

  const db = getDb();

  await db
    .insert(productsTable)
    .values(readyRows)
    .onConflictDoUpdate({
      target: productsTable.id,
      set: {
        title: sql`excluded.title`,
        titleKm: sql`excluded.title_km`,
        category: sql`excluded.category`,
        categoryLabel: sql`excluded.category_label`,
        categoryLabelKm: sql`excluded.category_label_km`,
        useCase: sql`excluded.use_case`,
        useCaseKm: sql`excluded.use_case_km`,
        description: sql`excluded.description`,
        descriptionKm: sql`excluded.description_km`,
        imageUrl: sql`excluded.image_url`,
        imageUrls: sql`excluded.image_urls`,
        price: sql`excluded.price`,
        oldPrice: sql`excluded.old_price`,
        badge: sql`excluded.badge`,
        tags: sql`excluded.tags`,
        currency: sql`excluded.currency`,
        inStock: sql`excluded.in_stock`,
        sortOrder: sql`excluded.sort_order`,
        isActive: sql`excluded.is_active`,
        rawCategory: sql`excluded.raw_category`,
        packQty: sql`excluded.pack_qty`,
        holeSize: sql`excluded.hole_size`,
        sourceSheet: sql`excluded.source_sheet`,
        sourceBlock: sql`excluded.source_block`,
        sourceRow: sql`excluded.source_row`,
        sourceSegment: sql`excluded.source_segment`,
        needsReview: sql`excluded.needs_review`,
        reviewFlags: sql`excluded.review_flags`,
        migrationBatchId: sql`excluded.migration_batch_id`,
        updatedAt: sql`now()`,
      },
    });

  return { count: readyRows.length };
}
