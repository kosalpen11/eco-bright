import { asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { mapProductRowToProduct } from "@/db/mappers/product-row-to-product";
import { productsTable, type ProductInsert } from "@/db/schema";
import type { Product } from "@/types/product";

function mapProductToInsert(product: Product): ProductInsert {
  return {
    id: product.id,
    title: product.title,
    titleKm: product.titleKm ?? null,
    category: product.category,
    categoryLabel: product.categoryLabel,
    categoryLabelKm: product.categoryLabelKm ?? null,
    useCase: product.useCase ?? null,
    useCaseKm: product.useCaseKm ?? null,
    description: product.description,
    descriptionKm: product.descriptionKm ?? null,
    imageUrl: product.imageUrl,
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
        updatedAt: sql`now()`,
      },
    });

  return { count: products.length };
}
