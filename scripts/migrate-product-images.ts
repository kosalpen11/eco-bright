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

  // If legacy image_url contains comma-separated URLs ("a,b,c"), split + trim.
  await sql`
    UPDATE products
    SET image_urls = (
      SELECT array_agg(trim(x))
      FROM unnest(regexp_split_to_array(image_url, '\\s*,\\s*')) AS x
      WHERE trim(x) <> ''
    )
    WHERE image_url IS NOT NULL
      AND image_url <> ''
      AND image_url LIKE '%,%'
      AND (
        image_urls IS NULL
        OR array_length(image_urls, 1) IS NULL
        OR (array_length(image_urls, 1) = 1 AND image_urls[1] = image_url)
      )
  `;

  // Backfill image_urls from legacy image_url (single URL) where needed.
  await sql`
    UPDATE products
    SET image_urls = ARRAY[image_url]
    WHERE (image_urls IS NULL OR array_length(image_urls, 1) IS NULL)
      AND image_url IS NOT NULL
      AND image_url <> ''
  `;

  console.info("[neon] Migration complete: ensured products.image_urls and backfilled from image_url.");
}

main().catch((error) => {
  console.error("[neon] Product image migration failed", error);
  process.exit(1);
});
