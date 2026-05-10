import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { neon } from "@neondatabase/serverless";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing required env: DATABASE_URL");
  }

  const sql = neon(url);

  const rows = await sql`
    SELECT id, title, category, category_label AS "categoryLabel"
    FROM products
    WHERE is_active = true
      AND id <> ''
    ORDER BY title ASC
  `;

  const outDir = resolve(process.cwd(), "artifacts", "image-crawl");
  mkdirSync(outDir, { recursive: true });

  const outPath = resolve(outDir, "products.json");
  writeFileSync(
    outPath,
    JSON.stringify(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        category_label: r.categoryLabel,
      })),
      null,
      2,
    ) + "\n",
    "utf8",
  );

  console.info(`[crawl] Exported ${rows.length} products to ${outPath}`);
  console.info(
    "[crawl] Next: create a sources file as [{ id, url }] (see scripts/examples/product-image-sources.example.json), then run scripts/crawl-product-images.ts",
  );
}

main().catch((error) => {
  console.error("[crawl] Export failed", error);
  process.exit(1);
});
