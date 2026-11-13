/**
 * Applies (up) or reverses (down) the catalog cleanup against DATABASE_URL.
 * Run: npx tsx scripts/catalog-cleanup-2026-11/apply.ts up|down
 * Both SQL files run inside a single transaction.
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import path from "node:path";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

import { PRODUCTS } from "./mapping";

config({ path: ".env.local", quiet: true });
config({ quiet: true });
neonConfig.webSocketConstructor = ws;

async function main() {
  const direction = process.argv[2];
  if (direction !== "up" && direction !== "down") {
    throw new Error("Usage: apply.ts up|down");
  }
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL");

  const pool = new Pool({ connectionString: url });
  try {
    if (direction === "up") {
      // Refuse to run if the live catalog has products the mapping doesn't know about.
      const { rows } = await pool.query<{ id: string }>("SELECT id FROM products");
      const mapped = new Set(PRODUCTS.map((product) => product.id));
      const unmapped = rows.map((row) => row.id).filter((id) => !mapped.has(id));
      const missing = [...mapped].filter((id) => !rows.some((row) => row.id === id));
      if (unmapped.length || missing.length) {
        throw new Error(`Mapping mismatch. Unmapped in DB: ${unmapped.join(", ") || "-"}; not in DB: ${missing.join(", ") || "-"}`);
      }
    }

    const file = direction === "up" ? "0016_catalog_cleanup.sql" : "0016_catalog_cleanup.down.sql";
    const sqlText = readFileSync(path.join(process.cwd(), "drizzle", file), "utf8");
    await pool.query(sqlText);
    console.log(`Applied ${file}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
