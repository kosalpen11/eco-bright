/**
 * Read-only catalog audit: counts per category/brand, missing values, duplicate titles,
 * plus EXPLAIN ANALYZE of the listing query. Compares with snapshot-before-2026-11-13.json.
 * Run: npx tsx scripts/catalog-cleanup-2026-11/audit.ts
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import path from "node:path";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

config({ path: ".env.local", quiet: true });
config({ quiet: true });
neonConfig.webSocketConstructor = ws;

type Row = Record<string, unknown>;

function count<T extends string>(values: T[]) {
  const map = new Map<string, number>();
  for (const value of values) map.set(value, (map.get(value) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function summarize(rows: Row[], brandOf: (row: Row) => string) {
  const titles = count(rows.map((row) => String(row.title).trim().toLowerCase()));
  return {
    total: rows.length,
    categories: count(rows.map((row) => String(row.category))),
    brands: count(rows.map(brandOf)),
    emptyCategory: rows.filter((row) => !String(row.category ?? "").trim()).length,
    emptyImage: rows.filter((row) => !row.image_url && !(row.image_urls as unknown[] | null)?.length).length,
    emptyPrice: rows.filter((row) => !Number(row.price)).length,
    duplicateTitleGroups: titles.filter(([, n]) => n > 1).length,
    productsInDuplicateGroups: titles.filter(([, n]) => n > 1).reduce((sum, [, n]) => sum + n, 0),
  };
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const snapshot = JSON.parse(
      readFileSync(path.join(process.cwd(), "scripts/catalog-cleanup-2026-11/snapshot-before-2026-11-13.json"), "utf8"),
    ) as { products: Array<{ row: Row }> };
    const before = summarize(
      snapshot.products.map((item) => item.row),
      (row) => `${String(row.id).split("_")[0]} (id prefix)`,
    );

    const { rows: live } = await pool.query<Row>("SELECT * FROM products");
    const after = summarize(live, (row) => (row.brand ? String(row.brand) : "(no brand)"));
    const { rows: missingSlug } = await pool.query("SELECT COUNT(*)::int n FROM products WHERE slug_public IS NULL OR category_id IS NULL");

    console.log(JSON.stringify({ before, after, missingSlugOrCategoryId: missingSlug[0].n }, null, 2));

    // Representative listing query (same shape as getCatalogListing): filters + sort + page.
    const listingSql = `
      WITH filtered AS (
        SELECT p.* FROM products p
        WHERE p.is_active = true AND p.id <> '' AND p.price >= 5 AND p.price <= 50
          AND p.category = 'lights' AND lower(p.brand) = 'grace'
      ),
      paged AS (
        SELECT p.*, row_number() OVER (ORDER BY p.price ASC, p.title ASC, p.id ASC) AS listing_rank
        FROM filtered p ORDER BY p.price ASC, p.title ASC, p.id ASC LIMIT 24 OFFSET 0
      )
      SELECT
        (SELECT COUNT(*)::int FROM filtered) AS total,
        (SELECT COUNT(*) FROM paged) AS page_rows,
        (SELECT jsonb_agg(x) FROM (
          SELECT c.slug, COUNT(*) n FROM products p JOIN categories c ON c.id = p.category_id
          WHERE p.is_active = true AND p.id <> '' AND p.price >= 5 AND p.price <= 50 AND lower(p.brand) = 'grace'
          GROUP BY c.slug) x) AS categories,
        (SELECT jsonb_agg(y) FROM (
          SELECT p.brand, COUNT(*) n FROM products p
          WHERE p.is_active = true AND p.id <> '' AND p.price >= 5 AND p.price <= 50 AND p.category = 'lights' AND p.brand IS NOT NULL
          GROUP BY p.brand) y) AS brands`;

    const client = await pool.connect();
    try {
      const plan = await client.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) ${listingSql}`);
      console.log("\n=== EXPLAIN ANALYZE (planner's choice) ===");
      console.log(plan.rows.map((r) => r["QUERY PLAN"]).join("\n"));

      await client.query("SET enable_seqscan = off");
      const forced = await client.query(`EXPLAIN (ANALYZE, FORMAT TEXT) ${listingSql}`);
      console.log("\n=== EXPLAIN ANALYZE with enable_seqscan=off (shows the new indexes are usable) ===");
      console.log(forced.rows.map((r) => r["QUERY PLAN"]).join("\n"));
      await client.query("RESET enable_seqscan");
    } finally {
      client.release();
    }

    const { rows: indexes } = await pool.query(
      "SELECT indexname FROM pg_indexes WHERE tablename = 'products' AND indexname IN ('products_slug_public_key','products_active_category_price_idx','products_active_brand_price_idx')",
    );
    console.log("\nnew indexes present:", indexes.map((row) => row.indexname).join(", "));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
