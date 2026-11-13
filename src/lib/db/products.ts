import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type {
  Product,
  ProductAttributeValue,
  ProductCategory,
  ProductFilters,
  ProductSpecs,
  ProductVariant,
} from "@/lib/types";

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

type FilterParts = { base: ReturnType<SqlClient>[]; category: ReturnType<SqlClient> | null; brand: ReturnType<SqlClient> | null };

function joinAnd(sql: SqlClient, parts: ReturnType<SqlClient>[]) {
  let clause = sql`TRUE`;
  for (const part of parts) clause = sql`${clause} AND ${part}`;
  return clause;
}

/**
 * Splits filters into the "base" set (search, price, active) and the two facet filters.
 * Category counts apply the brand filter (not their own); brand counts apply the category
 * filter. So every count equals what the list shows after clicking that chip.
 */
function buildFilterParts(sql: SqlClient, filters: ProductFilters): FilterParts {
  const base = [sql`p.is_active = true`, sql`p.id <> ''`];

  const q = (filters.q ?? "").trim();
  if (q) {
    const pattern = `%${q}%`;
    base.push(
      sql`(
        p.title ILIKE ${pattern}
        OR COALESCE(p.use_case, '') ILIKE ${pattern}
        OR COALESCE(p.description, '') ILIKE ${pattern}
        OR COALESCE(p.brand, '') ILIKE ${pattern}
        OR COALESCE(p.slug_public, '') ILIKE ${pattern}
        OR p.id ILIKE ${pattern}
        OR EXISTS (
          SELECT 1 FROM unnest(COALESCE(p.tags, ARRAY[]::text[])) AS tag WHERE tag ILIKE ${pattern}
        )
      )`,
    );
  }
  if (typeof filters.minPrice === "number") base.push(sql`p.price >= ${filters.minPrice}`);
  if (typeof filters.maxPrice === "number") base.push(sql`p.price <= ${filters.maxPrice}`);

  const brand = (filters.brand ?? "").trim();
  const category = (filters.category ?? "").trim();
  return {
    base,
    category: category ? sql`p.category = ${category}` : null,
    brand: brand ? sql`lower(p.brand) = ${brand.toLowerCase()}` : null,
  };
}

function buildOrderClause(sql: SqlClient, sort: ProductFilters["sort"]) {
  switch (sort) {
    case "price-asc":
      return sql`ORDER BY p.price ASC, p.title ASC, p.id ASC`;
    case "price-desc":
      return sql`ORDER BY p.price DESC, p.title ASC, p.id ASC`;
    case "name-asc":
      return sql`ORDER BY p.title ASC, p.id ASC`;
    case "default":
    default:
      return sql`ORDER BY p.sort_order NULLS LAST, p.title ASC, p.id ASC`;
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

function toAttributeValue(value: unknown): ProductAttributeValue | null {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    const items = value.filter(
      (entry): entry is string | number =>
        typeof entry === "string" || typeof entry === "number",
    );
    return items.length > 0 ? items : null;
  }

  return null;
}

function toAttributes(value: unknown): Record<string, ProductAttributeValue> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const entries = Object.entries(value).flatMap(([key, raw]) => {
    const normalized = toAttributeValue(raw);
    return normalized === null ? [] : [[key, normalized] as const];
  });

  return Object.fromEntries(entries);
}

function toSpecs(row: Record<string, unknown>): ProductSpecs {
  const text = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;

  return {
    length: text(row.specLength),
    voltage: text(row.specVoltage),
    wattage: text(row.specWattage),
    color: text(row.specColor),
    colorKm: text(row.specColorKm),
    warranty: text(row.warranty),
    warrantyKm: text(row.warrantyKm),
  };
}

function toStockQty(value: unknown): number | null {
  return toNullableNumber(value);
}

function toVariantAttributes(value: unknown): Record<string, ProductAttributeValue> {
  if (!value) {
    return {};
  }

  if (Array.isArray(value)) {
    const entries = value.flatMap((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return [];
      }

      const candidate = entry as Record<string, unknown>;
      const nameSource =
        candidate.name ??
        candidate.attributeName ??
        candidate.attribute_name ??
        candidate.label;
      const rawValue =
        candidate.value ??
        candidate.attributeValue ??
        candidate.attribute_value;

      const name = typeof nameSource === "string" ? nameSource.trim() : "";
      const normalizedValue = toAttributeValue(rawValue);

      if (!name || normalizedValue === null) {
        return [];
      }

      return [[name, normalizedValue] as const];
    });

    return Object.fromEntries(entries);
  }

  return toAttributes(value);
}

function toVariants(value: unknown): ProductVariant[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return [];
    }

    const candidate = entry as Record<string, unknown>;
    const labelSource =
      candidate.label ??
      candidate.title ??
      candidate.name ??
      candidate.option ??
      candidate.value ??
      candidate.sku;

    const label = typeof labelSource === "string" ? labelSource.trim() : "";
    if (!label) return [];

    const idSource =
      candidate.id ?? candidate.sku ?? candidate.code ?? candidate.value ?? `${label}-${index}`;
    const id = String(idSource).trim() || `${label}-${index}`;

    const rawImageUrl = candidate.imageUrl ?? candidate.image_url;
    const rawPrice = candidate.price;
    const rawOldPrice = candidate.oldPrice ?? candidate.old_price;
    const rawStockQty = candidate.stockQty ?? candidate.stock_qty;
    const rawInStock = candidate.inStock ?? candidate.in_stock;
    const rawAttributes =
      candidate.attributes ??
      candidate.attributePairs ??
      candidate.attribute_pairs ??
      candidate.variantAttributes ??
      candidate.variant_attributes;

    return [
      {
        id,
        label,
        value: typeof candidate.value === "string" ? candidate.value : null,
        imageUrl: typeof rawImageUrl === "string" ? rawImageUrl : null,
        price: toNullableNumber(rawPrice),
        oldPrice: toNullableNumber(rawOldPrice),
        attributes: toVariantAttributes(rawAttributes),
        stockQty: toStockQty(rawStockQty),
        inStock: typeof rawInStock === "boolean" ? rawInStock : null,
        isActive:
          typeof candidate.is_active === "boolean"
            ? candidate.is_active
            : typeof candidate.isActive === "boolean"
            ? candidate.isActive
            : true,
      },
    ];
  });
}

/** Columns + variant/attribute joins shared by the listing and the product page. Alias must be `p`. */
function productSelect(sql: SqlClient) {
  return sql`
    SELECT
      p.id,
      p.slug_public AS "slug",
      p.brand,
      p.title,
      p.title_km AS "titleKm",
      COALESCE(to_jsonb(p) ->> 'name', p.title) AS name,
      p.category,
      COALESCE(c.name, p.category_label) AS "categoryLabel",
      COALESCE(c.name_km, p.category_label_km) AS "categoryLabelKm",
      p.description,
      p.description_km AS "descriptionKm",
      p.price,
      p.old_price AS "oldPrice",
      p.badge,
      p.tags,
      p.pack_qty::text AS "packQty",
      p.hole_size AS "holeSize",
      p.use_case AS "useCase",
      p.use_case_km AS "useCaseKm",
      p.image_url AS "imageUrl",
      COALESCE(p.image_urls, ARRAY[]::text[]) AS "imageUrls",
      p.currency,
      p.stock_qty AS "stockQty",
      p.in_stock AS "inStock",
      p.rating,
      COALESCE(NULLIF(product_attribute_data.attributes, '{}'::jsonb), '{}'::jsonb) AS attributes,
      COALESCE(variant_data.variants, '[]'::jsonb) AS variants,
      p.is_active AS "isActive",
      p.sort_order AS "sortOrder",
      p.spec_length AS "specLength",
      p.spec_voltage AS "specVoltage",
      p.spec_wattage AS "specWattage",
      p.spec_color AS "specColor",
      p.spec_color_km AS "specColorKm",
      p.warranty AS "warranty",
      p.warranty_km AS "warrantyKm"
  `;
}

function productJoins(sql: SqlClient) {
  return sql`
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_object_agg(attribute_rows.name, attribute_rows.value_json), '{}'::jsonb) AS attributes
      FROM (
        SELECT
          pa.name,
          CASE
            WHEN COUNT(DISTINCT pav.value) = 1 THEN to_jsonb(MIN(pav.value))
            ELSE to_jsonb(array_agg(DISTINCT pav.value ORDER BY pav.value))
          END AS value_json
        FROM product_variants pv
        INNER JOIN product_variant_attribute_values pvav ON pvav.product_variant_id = pv.id
        INNER JOIN product_attribute_values pav ON pav.id = pvav.product_attribute_value_id
        INNER JOIN product_attributes pa ON pa.id = pav.product_attribute_id
        WHERE pv.product_id = p.id AND pv.is_active = true
        GROUP BY pa.name
      ) AS attribute_rows
    ) AS product_attribute_data ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', pv.id,
            'sku', pv.sku,
            'title', pv.title,
            'label', COALESCE(NULLIF(pv.title, ''), NULLIF(pv.sku, ''), pv.id),
            'price', pv.price,
            'old_price', pv.old_price,
            'currency', pv.currency,
            'stock_qty', pv.stock_qty,
            'in_stock', CASE WHEN pv.stock_qty > 0 THEN true ELSE false END,
            'image_url', pv.image_url,
            'sort_order', pv.sort_order,
            'is_active', pv.is_active,
            'attributes', COALESCE(variant_attribute_data.attributes, '{}'::jsonb)
          )
          ORDER BY pv.sort_order ASC, pv.title ASC, pv.id ASC
        ),
        '[]'::jsonb
      ) AS variants
      FROM product_variants pv
      LEFT JOIN LATERAL (
        SELECT COALESCE(jsonb_object_agg(attribute_rows.name, attribute_rows.value_json), '{}'::jsonb) AS attributes
        FROM (
          SELECT
            pa.name,
            CASE
              WHEN COUNT(DISTINCT pav.value) = 1 THEN to_jsonb(MIN(pav.value))
              ELSE to_jsonb(array_agg(DISTINCT pav.value ORDER BY pav.value))
            END AS value_json
          FROM product_variant_attribute_values pvav
          INNER JOIN product_attribute_values pav ON pav.id = pvav.product_attribute_value_id
          INNER JOIN product_attributes pa ON pa.id = pav.product_attribute_id
          WHERE pvav.product_variant_id = pv.id
          GROUP BY pa.name
        ) AS attribute_rows
      ) AS variant_attribute_data ON true
      WHERE pv.product_id = p.id
    ) AS variant_data ON true
  `;
}

function mapProductRow(row: Record<string, unknown>): Product {
  const imageUrls = toStringArray(row.imageUrls);
  const imageUrl = typeof row.imageUrl === "string" ? row.imageUrl : null;
  return {
    id: String(row.id),
    slug: typeof row.slug === "string" && row.slug ? row.slug : null,
    brand: typeof row.brand === "string" && row.brand ? row.brand : null,
    title: String(row.title ?? ""),
    titleKm: (row.titleKm as string | null) ?? null,
    name: String(row.name ?? row.title ?? ""),
    category: String(row.category ?? ""),
    categoryLabel: String(row.categoryLabel ?? ""),
    categoryLabelKm: (row.categoryLabelKm as string | null) ?? null,
    description: String(row.description ?? ""),
    descriptionKm: (row.descriptionKm as string | null) ?? null,
    price: toNumber(row.price),
    oldPrice: toNullableNumber(row.oldPrice),
    badge: (row.badge as string | null) ?? null,
    tags: toStringArray(row.tags),
    packQty: (row.packQty as string | null) ?? null,
    holeSize: (row.holeSize as string | null) ?? null,
    useCase: (row.useCase as string | null) ?? null,
    useCaseKm: (row.useCaseKm as string | null) ?? null,
    imageUrl,
    imageUrls: imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [],
    currency: String(row.currency ?? "USD"),
    stockQty: toStockQty(row.stockQty),
    inStock: Boolean(row.inStock),
    rating: toNullableNumber(row.rating),
    attributes: toAttributes(row.attributes),
    variants: toVariants(row.variants),
    isActive: Boolean(row.isActive),
    sortOrder: (row.sortOrder as number | null) ?? null,
    specs: toSpecs(row),
  };
}

export interface CatalogFacet {
  id: string;
  label: string;
  labelKm: string | null;
  count: number;
}

export interface CatalogListing {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  /** Non-empty categories, counted with every filter except category. */
  categories: CatalogFacet[];
  /** Brands with products, counted with every filter except brand. */
  brands: CatalogFacet[];
}

/**
 * The listing in ONE statement: product page, total and both facet counts all come from
 * the same filtered set, so chip counts always match the list.
 */
export async function getCatalogListing(filters: ProductFilters): Promise<CatalogListing> {
  const sql = getSql();
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const offset = (page - 1) * PAGE_SIZE;
  const parts = buildFilterParts(sql, filters);
  const order = buildOrderClause(sql, filters.sort ?? "default");
  const baseWhere = joinAnd(sql, parts.base);
  const categoryCond = parts.category ?? sql`TRUE`;
  const brandCond = parts.brand ?? sql`TRUE`;

  const rows = await sql`
    WITH filtered AS (
      SELECT p.* FROM products p
      WHERE ${baseWhere} AND ${categoryCond} AND ${brandCond}
    ),
    paged AS (
      SELECT p.*, row_number() OVER (${order}) AS listing_rank
      FROM filtered p
      ${order}
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    ),
    items AS (
      ${productSelect(sql)}, p.listing_rank
      FROM paged p
      ${productJoins(sql)}
    )
    SELECT
      (SELECT COUNT(*)::int FROM filtered) AS total,
      COALESCE((SELECT jsonb_agg(to_jsonb(i) ORDER BY i.listing_rank) FROM items i), '[]'::jsonb) AS products,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object('id', x.slug, 'label', x.name, 'labelKm', x.name_km, 'count', x.n) ORDER BY x.sort_order NULLS LAST, x.name)
        FROM (
          SELECT c.slug, c.name, c.name_km, c.sort_order, COUNT(*)::int AS n
          FROM products p
          JOIN categories c ON c.id = p.category_id
          WHERE ${baseWhere} AND ${brandCond}
          GROUP BY c.slug, c.name, c.name_km, c.sort_order
        ) x
      ), '[]'::jsonb) AS categories,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object('id', y.brand, 'label', y.brand, 'labelKm', NULL, 'count', y.n) ORDER BY y.n DESC, y.brand)
        FROM (
          SELECT p.brand, COUNT(*)::int AS n
          FROM products p
          WHERE ${baseWhere} AND ${categoryCond} AND p.brand IS NOT NULL
          GROUP BY p.brand
        ) y
      ), '[]'::jsonb) AS brands
  `;

  const row = rows[0] ?? {};
  const toFacets = (value: unknown): CatalogFacet[] =>
    (Array.isArray(value) ? value : []).map((item) => ({
      id: String(item.id),
      label: String(item.label),
      labelKm: item.labelKm ?? null,
      count: Number(item.count ?? 0),
    }));

  return {
    products: (Array.isArray(row.products) ? row.products : []).map(mapProductRow),
    total: Number(row.total ?? 0),
    page,
    pageSize: PAGE_SIZE,
    categories: toFacets(row.categories),
    brands: toFacets(row.brands),
  };
}

/** Kept for callers that only need a product page (e.g. related products). */
export async function getProducts(filters: ProductFilters) {
  const { products, total, page, pageSize } = await getCatalogListing(filters);
  return { products, total, page, pageSize };
}

/** Non-empty categories with Khmer names, in shop order (header chips on product pages). */
export async function getCategories(): Promise<ProductCategory[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT c.slug AS id, c.name AS label, c.name_km AS "labelKm", COUNT(p.id)::int AS count
    FROM categories c
    JOIN products p ON p.category_id = c.id AND p.is_active = true
    GROUP BY c.slug, c.name, c.name_km, c.sort_order
    ORDER BY c.sort_order NULLS LAST, c.name
  `;
  return rows.map((row) => ({
    id: String(row.id),
    label: String(row.label),
    labelKm: row.labelKm ?? null,
    count: Number(row.count ?? 0),
  }));
}

/** Real brands (products.brand), most products first. */
export async function getBrands(): Promise<Array<{ id: string; label: string; count: number }>> {
  const sql = getSql();
  const rows = await sql`
    SELECT brand, COUNT(*)::int AS count
    FROM products
    WHERE is_active = true AND brand IS NOT NULL
    GROUP BY brand
    ORDER BY count DESC, brand
  `;
  return rows.map((row) => ({ id: String(row.brand), label: String(row.brand), count: Number(row.count) }));
}

/**
 * Recommended products ("ផលិតផលណែនាំ"), ordered by products.featured_rank (1 = first).
 * Reads the column through to_jsonb so it returns [] until migration 0017 has run.
 */
export async function getRecommendedProducts(limit = 8): Promise<Product[]> {
  const sql = getSql();
  const rows = await sql`
    ${productSelect(sql)}, (to_jsonb(p) ->> 'featured_rank')::int AS "featuredRank"
    FROM products p
    ${productJoins(sql)}
    WHERE p.is_active = true AND NULLIF(to_jsonb(p) ->> 'featured_rank', '') IS NOT NULL
    ORDER BY (to_jsonb(p) ->> 'featured_rank')::int ASC, p.title ASC
    LIMIT ${limit}
  `;
  return rows.map(mapProductRow);
}

/** Finds an active product by public slug or by legacy id (old URLs). */
export async function getProductBySlugOrId(key: string): Promise<Product | null> {
  const sql = getSql();
  const rows = await sql`
    ${productSelect(sql)}
    FROM products p
    ${productJoins(sql)}
    WHERE (p.slug_public = ${key} OR p.id = ${key}) AND p.is_active = true
    ORDER BY (p.slug_public = ${key}) DESC
    LIMIT 1
  `;
  return rows[0] ? mapProductRow(rows[0]) : null;
}

export async function getProductById(id: string): Promise<Product | null> {
  return getProductBySlugOrId(id);
}

/** Active product slugs with last-modified time, for app/sitemap.ts. */
export async function getSitemapProducts(): Promise<Array<{ id: string; slug: string; updatedAt: Date | null }>> {
  const sql = getSql();
  const rows = await sql`
    SELECT p.id, COALESCE(p.slug_public, p.id) AS slug, p.updated_at AS "updatedAt"
    FROM products p
    WHERE p.is_active = true AND p.id <> ''
    ORDER BY p.sort_order ASC NULLS LAST, p.id ASC
  `;
  return rows.map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : null,
  }));
}
