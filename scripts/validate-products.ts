import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { runCatalogPipeline } from "../src/lib/catalog/pipeline";
import { formatCatalogSummary } from "../src/lib/catalog/reporting";

function parseFilePath() {
  const filePath = process.argv[2];

  if (!filePath) {
    throw new Error("Usage: npm run validate:products -- ./path/to/products.csv");
  }

  return resolve(process.cwd(), filePath);
}

async function main() {
  const filePath = parseFilePath();
  const result = runCatalogPipeline({ filePath });
  const outputDir = resolve(process.cwd(), "artifacts", "catalog-migration", result.batchId);

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(
    resolve(outputDir, "profile.json"),
    JSON.stringify(result.summary, null, 2),
    "utf8",
  );

  console.info(formatCatalogSummary(result.summary));
  console.info(`[catalog] Wrote profile.json to ${outputDir}`);
}

main().catch((error) => {
  console.error("[catalog] Validation failed", error);
  process.exit(1);
});
