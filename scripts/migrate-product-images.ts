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

  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS image_urls TEXT[]
  `;

  // Backfill image_urls from legacy image_url where needed.
  await sql`
    UPDATE products
    SET image_urls = ARRAY[image_url]
    WHERE (image_urls IS NULL OR array_length(image_urls, 1) IS NULL)
      AND image_url IS NOT NULL
  `;

  console.info("[neon] Migration complete: ensured products.image_urls and backfilled from image_url.");
}

main().catch((error) => {
  console.error("[neon] Product image migration failed", error);
  process.exit(1);
});

