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
    ADD COLUMN IF NOT EXISTS brand TEXT NOT NULL DEFAULT 'ecobright'
  `;

  // Backfill any legacy nulls (in case the column existed but allowed nulls).
  await sql`
    UPDATE products
    SET brand = 'ecobright'
    WHERE brand IS NULL OR brand = ''
  `;

  console.info("[neon] Migration complete: ensured products.brand with default ecobright.");
}

main().catch((error) => {
  console.error("[neon] Product brand migration failed", error);
  process.exit(1);
});

