import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { Product, ProductCategory, ProductFilters } from "@/lib/types";

const PAGE_SIZE = 24;

type SqlClient = NeonQueryFunction<false, false>;

let cachedSql: SqlClient | null = null;

function getSql(): SqlClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing required env: DATABASE_URL");
  }

  cachedSql ??= neon(url);
  return cachedSql;
}

function buildWhereClause(sql: SqlClient, filters: ProductFilters) {
  const parts = [sql`p.is_active = true`, sql`p.id <> ''`];

  const brand = (filters.brand ?? "").trim();
  if (brand) {
    const normalized = brand.toLowerCase();
    // Product "brand" is derived from id prefix: grace_001 => brand "grace".
    // Underscore is a LIKE wildcard, so escape it to match the literal `_`.
    const pattern = `${normalized}\\_%`;
    parts.push(sql`LOWER(p.id) LIKE ${pattern} ESCAPE '\\'`);
  }

  if (filters.category) {
    parts.push(sql`p.category = ${filters.category}`);
  }

  const q = (filters.q ?? "").trim();
  if (q) {
    const pattern = `%${q}%`;
    parts.push(
      sql`(p.title ILIKE ${pattern} OR COALESCE(p.use_case, '') ILIKE ${pattern} OR p.id ILIKE ${pattern})`,
    );
  }

  if (typeof filters.minPrice === "number") {
    parts.push(sql`p.price >= ${filters.minPrice}`);
  }

  if (typeof filters.maxPrice === "number") {
    parts.push(sql`p.price <= ${filters.maxPrice}`);
  }

  let where = sql`WHERE ${parts[0]}`;
  for (let i = 1; i < parts.length; i += 1) {
    where = sql`${where} AND ${parts[i]}`;
  }

  return where;
}

function buildOrderClause(sql: SqlClient, sort: ProductFilters["sort"]) {
  switch (sort) {
    case "price-asc":
      return sql`ORDER BY price ASC, title ASC`;
    case "price-desc":
      return sql`ORDER BY price DESC, title ASC`;
    case "name-asc":
      return sql`ORDER BY title ASC`;
    case "default":
    default:
      return sql`ORDER BY sort_order NULLS LAST, title ASC`;
  }
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return 0;
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

export async function getProducts(filters: ProductFilters): Promise<{
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const sql = getSql();

  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const offset = (page - 1) * PAGE_SIZE;
  const where = buildWhereClause(sql, filters);
  const order = buildOrderClause(sql, filters.sort ?? "default");

  const [countRows, productRows] = await sql.transaction([
    sql`SELECT COUNT(*)::int AS count FROM products p ${where}`,
    sql`
      SELECT
        p.id,
        p.title,
        COALESCE(to_jsonb(p) ->> 'name', p.title) AS name,
        p.category,
        p.category_label AS "categoryLabel",
        p.price,
        p.old_price AS "oldPrice",
        p.badge,
        p.pack_qty::text AS "packQty",
        p.use_case AS "useCase",
        p.image_url AS "imageUrl",
        ARRAY(
          SELECT jsonb_array_elements_text(
            COALESCE(to_jsonb(p) -> 'image_urls', '[]'::jsonb)
          )
        ) AS "imageUrls",
        p.currency,
        p.in_stock AS "inStock",
        p.is_active AS "isActive",
        p.sort_order AS "sortOrder"
      FROM products p
      ${where}
      ${order}
      LIMIT ${PAGE_SIZE}
      OFFSET ${offset}
    `,
  ]);

  const total = Number(countRows?.[0]?.count ?? 0);

  const products: Product[] = (productRows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    name: row.name,
    category: row.category,
    categoryLabel: row.categoryLabel,
    price: toNumber(row.price),
    oldPrice: toNullableNumber(row.oldPrice),
    badge: row.badge ?? null,
    packQty: row.packQty ?? null,
    useCase: row.useCase ?? null,
    imageUrl: row.imageUrl ?? null,
    imageUrls:
      toStringArray(row.imageUrls).length > 0
        ? toStringArray(row.imageUrls)
        : row.imageUrl
          ? [row.imageUrl]
          : [],
    currency: row.currency,
    inStock: row.inStock,
    isActive: row.isActive,
    sortOrder: row.sortOrder ?? null,
  }));

  return { products, total, page, pageSize: PAGE_SIZE };
}

export async function getCategories(filters?: { brand?: string | null }): Promise<ProductCategory[]> {
  const sql = getSql();

  // Brand is optional; if the column doesn't exist yet, COALESCE handles it.
  const brand = (filters?.brand ?? "").trim();
  const brandClause = brand
    ? sql`LOWER(p.id) LIKE ${`${brand.toLowerCase()}\\_%`} ESCAPE '\\'`
    : sql`TRUE`;

  const rows = await sql`
    SELECT
      category AS id,
      MIN(category_label) AS label,
      COUNT(*)::int AS count
    FROM products p
    WHERE p.is_active = true AND ${brandClause}
    GROUP BY category
    ORDER BY label ASC
  `;

  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    count: Number(row.count ?? 0),
  }));
}

export async function getBrands(): Promise<Array<{ id: string; label: string; count: number }>> {
  const sql = getSql();

  const rows = await sql`
    SELECT
      LOWER(split_part(p.id, '_', 1)) AS id,
      COUNT(*)::int AS count
    FROM products p
    WHERE p.is_active = true
      AND p.id <> ''
      AND position('_' in p.id) > 0
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  return rows.map((row) => ({
    id: row.id,
    label: row.id ? row.id.charAt(0).toUpperCase() + row.id.slice(1) : row.id,
    count: Number(row.count ?? 0),
  }));
}

export async function getProductById(id: string): Promise<Product | null> {
  const sql = getSql();

  const rows = await sql`
    SELECT
      p.id,
      p.title,
      COALESCE(to_jsonb(p) ->> 'name', p.title) AS name,
      p.category,
      p.category_label AS "categoryLabel",
      p.price,
      p.old_price AS "oldPrice",
      p.badge,
      p.pack_qty::text AS "packQty",
      p.use_case AS "useCase",
      p.image_url AS "imageUrl",
      ARRAY(
        SELECT jsonb_array_elements_text(
          COALESCE(to_jsonb(p) -> 'image_urls', '[]'::jsonb)
        )
      ) AS "imageUrls",
      p.currency,
      p.in_stock AS "inStock",
      p.is_active AS "isActive",
      p.sort_order AS "sortOrder"
    FROM products p
    WHERE p.id = ${id} AND p.is_active = true
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    name: row.name,
    category: row.category,
    categoryLabel: row.categoryLabel,
    price: toNumber(row.price),
    oldPrice: toNullableNumber(row.oldPrice),
    badge: row.badge ?? null,
    packQty: row.packQty ?? null,
    useCase: row.useCase ?? null,
    imageUrl: row.imageUrl ?? null,
    imageUrls:
      toStringArray(row.imageUrls).length > 0
        ? toStringArray(row.imageUrls)
        : row.imageUrl
          ? [row.imageUrl]
          : [],
    currency: row.currency,
    inStock: row.inStock,
    isActive: row.isActive,
    sortOrder: row.sortOrder ?? null,
  };
}
