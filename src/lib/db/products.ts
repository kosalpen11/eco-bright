import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type {
  Product,
  ProductAttributeValue,
  ProductCategory,
  ProductFilters,
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
      sql`(
        p.title ILIKE ${pattern}
        OR COALESCE(p.use_case, '') ILIKE ${pattern}
        OR COALESCE(p.description, '') ILIKE ${pattern}
        OR p.id ILIKE ${pattern}
        OR EXISTS (
          SELECT 1
          FROM unnest(COALESCE(p.tags, ARRAY[]::text[])) AS tag
          WHERE tag ILIKE ${pattern}
        )
      )`,
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
        p.title_km AS "titleKm",
        COALESCE(to_jsonb(p) ->> 'name', p.title) AS name,
        p.category,
        p.category_label AS "categoryLabel",
        p.category_label_km AS "categoryLabelKm",
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
        NULLIF(to_jsonb(p) ->> 'stock_qty', '') AS "stockQty",
        p.in_stock AS "inStock",
        NULLIF(to_jsonb(p) ->> 'rating', '')::numeric AS rating,
        COALESCE(
          NULLIF(product_attribute_data.attributes, '{}'::jsonb),
          COALESCE(to_jsonb(p) -> 'attributes', '{}'::jsonb)
        ) AS attributes,
        COALESCE(
          NULLIF(variant_data.variants, '[]'::jsonb),
          COALESCE(to_jsonb(p) -> 'variants', '[]'::jsonb)
        ) AS variants,
        p.is_active AS "isActive",
        p.sort_order AS "sortOrder"
      FROM products p
      LEFT JOIN LATERAL (
        SELECT COALESCE(
          jsonb_object_agg(attribute_rows.name, attribute_rows.value_json),
          '{}'::jsonb
        ) AS attributes
        FROM (
          SELECT
            pa.name,
            CASE
              WHEN COUNT(DISTINCT pav.value) = 1 THEN to_jsonb(MIN(pav.value))
              ELSE to_jsonb(array_agg(DISTINCT pav.value ORDER BY pav.value))
            END AS value_json
          FROM product_variants pv
          INNER JOIN product_variant_attribute_values pvav
            ON pvav.product_variant_id = pv.id
          INNER JOIN product_attribute_values pav
            ON pav.id = pvav.product_attribute_value_id
          INNER JOIN product_attributes pa
            ON pa.id = pav.product_attribute_id
          WHERE pv.product_id = p.id
            AND pv.is_active = true
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
          SELECT COALESCE(
            jsonb_object_agg(attribute_rows.name, attribute_rows.value_json),
            '{}'::jsonb
          ) AS attributes
          FROM (
            SELECT
              pa.name,
              CASE
                WHEN COUNT(DISTINCT pav.value) = 1 THEN to_jsonb(MIN(pav.value))
                ELSE to_jsonb(array_agg(DISTINCT pav.value ORDER BY pav.value))
              END AS value_json
            FROM product_variant_attribute_values pvav
            INNER JOIN product_attribute_values pav
              ON pav.id = pvav.product_attribute_value_id
            INNER JOIN product_attributes pa
              ON pa.id = pav.product_attribute_id
            WHERE pvav.product_variant_id = pv.id
            GROUP BY pa.name
          ) AS attribute_rows
        ) AS variant_attribute_data ON true
        WHERE pv.product_id = p.id
      ) AS variant_data ON true
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
    titleKm: row.titleKm ?? null,
    name: row.name,
    category: row.category,
    categoryLabel: row.categoryLabel,
    categoryLabelKm: row.categoryLabelKm ?? null,
    description: row.description,
    descriptionKm: row.descriptionKm ?? null,
    price: toNumber(row.price),
    oldPrice: toNullableNumber(row.oldPrice),
    badge: row.badge ?? null,
    tags: toStringArray(row.tags),
    packQty: row.packQty ?? null,
    holeSize: row.holeSize ?? null,
    useCase: row.useCase ?? null,
    useCaseKm: row.useCaseKm ?? null,
    imageUrl: row.imageUrl ?? null,
    imageUrls:
      toStringArray(row.imageUrls).length > 0
        ? toStringArray(row.imageUrls)
        : row.imageUrl
          ? [row.imageUrl]
          : [],
    currency: row.currency,
    stockQty: toStockQty(row.stockQty),
    inStock: row.inStock,
    rating: toNullableNumber(row.rating),
    attributes: toAttributes(row.attributes),
    variants: toVariants(row.variants),
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
      p.title_km AS "titleKm",
      COALESCE(to_jsonb(p) ->> 'name', p.title) AS name,
      p.category,
      p.category_label AS "categoryLabel",
      p.category_label_km AS "categoryLabelKm",
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
      NULLIF(to_jsonb(p) ->> 'stock_qty', '') AS "stockQty",
      p.in_stock AS "inStock",
      NULLIF(to_jsonb(p) ->> 'rating', '')::numeric AS rating,
      COALESCE(
        NULLIF(product_attribute_data.attributes, '{}'::jsonb),
        COALESCE(to_jsonb(p) -> 'attributes', '{}'::jsonb)
      ) AS attributes,
      COALESCE(
        NULLIF(variant_data.variants, '[]'::jsonb),
        COALESCE(to_jsonb(p) -> 'variants', '[]'::jsonb)
      ) AS variants,
      p.is_active AS "isActive",
      p.sort_order AS "sortOrder"
    FROM products p
    LEFT JOIN LATERAL (
      SELECT COALESCE(
        jsonb_object_agg(attribute_rows.name, attribute_rows.value_json),
        '{}'::jsonb
      ) AS attributes
      FROM (
        SELECT
          pa.name,
          CASE
            WHEN COUNT(DISTINCT pav.value) = 1 THEN to_jsonb(MIN(pav.value))
            ELSE to_jsonb(array_agg(DISTINCT pav.value ORDER BY pav.value))
          END AS value_json
        FROM product_variants pv
        INNER JOIN product_variant_attribute_values pvav
          ON pvav.product_variant_id = pv.id
        INNER JOIN product_attribute_values pav
          ON pav.id = pvav.product_attribute_value_id
        INNER JOIN product_attributes pa
          ON pa.id = pav.product_attribute_id
        WHERE pv.product_id = p.id
          AND pv.is_active = true
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
        SELECT COALESCE(
          jsonb_object_agg(attribute_rows.name, attribute_rows.value_json),
          '{}'::jsonb
        ) AS attributes
        FROM (
          SELECT
            pa.name,
            CASE
              WHEN COUNT(DISTINCT pav.value) = 1 THEN to_jsonb(MIN(pav.value))
              ELSE to_jsonb(array_agg(DISTINCT pav.value ORDER BY pav.value))
            END AS value_json
          FROM product_variant_attribute_values pvav
          INNER JOIN product_attribute_values pav
            ON pav.id = pvav.product_attribute_value_id
          INNER JOIN product_attributes pa
            ON pa.id = pav.product_attribute_id
          WHERE pvav.product_variant_id = pv.id
          GROUP BY pa.name
        ) AS attribute_rows
      ) AS variant_attribute_data ON true
      WHERE pv.product_id = p.id
    ) AS variant_data ON true
    WHERE p.id = ${id} AND p.is_active = true
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    titleKm: row.titleKm ?? null,
    name: row.name,
    category: row.category,
    categoryLabel: row.categoryLabel,
    categoryLabelKm: row.categoryLabelKm ?? null,
    description: row.description,
    descriptionKm: row.descriptionKm ?? null,
    price: toNumber(row.price),
    oldPrice: toNullableNumber(row.oldPrice),
    badge: row.badge ?? null,
    tags: toStringArray(row.tags),
    packQty: row.packQty ?? null,
    holeSize: row.holeSize ?? null,
    useCase: row.useCase ?? null,
    useCaseKm: row.useCaseKm ?? null,
    imageUrl: row.imageUrl ?? null,
    imageUrls:
      toStringArray(row.imageUrls).length > 0
        ? toStringArray(row.imageUrls)
        : row.imageUrl
          ? [row.imageUrl]
          : [],
    currency: row.currency,
    stockQty: toStockQty(row.stockQty),
    inStock: row.inStock,
    rating: toNullableNumber(row.rating),
    attributes: toAttributes(row.attributes),
    variants: toVariants(row.variants),
    isActive: row.isActive,
    sortOrder: row.sortOrder ?? null,
  };
}
