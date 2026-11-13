/**
 * Runs one hand-written SQL migration file against DATABASE_URL (as a single multi-statement query).
 * Run: npx tsx scripts/run-sql-migration.ts drizzle/0017_featured_products.sql
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import path from "node:path";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

config({ path: ".env.local", quiet: true });
config({ quiet: true });
neonConfig.webSocketConstructor = ws;

async function main() {
  const file = process.argv[2];
  if (!file?.endsWith(".sql")) throw new Error("Usage: run-sql-migration.ts <path/to/file.sql>");
  if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(readFileSync(path.resolve(process.cwd(), file), "utf8"));
    console.log(`Applied ${file}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
