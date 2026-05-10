import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

import { bulkUpdateProductImages, type ProductImageUpdate } from "../src/lib/db/product-images";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

function parseArgs() {
  const args = process.argv.slice(2);
  const filePath = args.find((arg) => !arg.startsWith("--"));
  if (!filePath) {
    throw new Error(
      "Usage: npx tsx scripts/bulk-update-product-images.ts ./path/to/updates.json",
    );
  }
  return { filePath };
}

function loadUpdates(filePath: string): ProductImageUpdate[] {
  const abs = resolve(process.cwd(), filePath);
  const raw = readFileSync(abs, "utf8");
  const data = JSON.parse(raw) as unknown;

  if (!Array.isArray(data)) {
    throw new Error("Expected JSON array: [{ id, imageUrls: [] }]");
  }

  return data as ProductImageUpdate[];
}

async function main() {
  const { filePath } = parseArgs();
  const updates = loadUpdates(filePath);

  // Update in batches to avoid oversized JSON payloads.
  const batchSize = 400;
  let updated = 0;

  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    const result = await bulkUpdateProductImages(batch);
    updated += result.updated;
    console.info(`[images] Updated ${result.updated} products (batch ${i / batchSize + 1}).`);
  }

  console.info(`[images] Done. Updated ${updated} products total.`);
}

main().catch((error) => {
  console.error("[images] Bulk update failed", error);
  process.exit(1);
});

