import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { runCatalogPipeline } from "../src/lib/catalog/pipeline";
import {
  buildCategoryProfileCsv,
  buildDuplicateClustersCsv,
  buildReviewRowsCsv,
  buildReviewSummaryMarkdown,
  formatCatalogSummary,
} from "../src/lib/catalog/reporting";

function parseFilePath() {
  const filePath = process.argv[2];

  if (!filePath) {
    throw new Error("Usage: npm run report:products -- ./path/to/products.csv");
  }

  return resolve(process.cwd(), filePath);
}

async function main() {
  const filePath = parseFilePath();
  const result = runCatalogPipeline({ filePath });
  const outputDir = resolve(process.cwd(), "artifacts", "catalog-migration", result.batchId);

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(
    resolve(outputDir, "review-summary.md"),
    buildReviewSummaryMarkdown({
      batchId: result.batchId,
      summary: result.summary,
    }),
    "utf8",
  );
  writeFileSync(
    resolve(outputDir, "review-rows.csv"),
    buildReviewRowsCsv(result.rows),
    "utf8",
  );
  writeFileSync(
    resolve(outputDir, "duplicate-clusters.csv"),
    buildDuplicateClustersCsv([
      ...result.exactDuplicates,
      ...result.nearDuplicates,
    ]),
    "utf8",
  );
  writeFileSync(
    resolve(outputDir, "category-profile.csv"),
    buildCategoryProfileCsv(result.summary),
    "utf8",
  );

  console.info(formatCatalogSummary(result.summary));
  console.info(`[catalog] Exported review report to ${outputDir}`);
}

main().catch((error) => {
  console.error("[catalog] Review report failed", error);
  process.exit(1);
});
