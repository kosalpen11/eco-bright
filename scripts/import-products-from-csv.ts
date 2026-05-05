import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { migrationRowToStagingInsert } from "../src/db/mappers/migration-row-to-product";
import { insertProductMigrationRows } from "../src/db/queries/product-migration-rows";
import { upsertNormalizedProducts } from "../src/db/queries/products";
import { runCatalogPipeline } from "../src/lib/catalog/pipeline";
import {
  buildNormalizedSheetsCsv,
  buildReviewRowsCsv,
  buildReviewSummaryMarkdown,
  formatCatalogSummary,
} from "../src/lib/catalog/reporting";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

interface CliOptions {
  filePath: string;
  target: "neon" | "sheets";
  apply: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const filePath = args.find((arg) => !arg.startsWith("--"));

  if (!filePath) {
    throw new Error(
      "Usage: npm run import:products:csv -- ./path/to/products.csv [--target neon|sheets] [--apply]",
    );
  }

  const targetFlag = args.find((arg) => arg.startsWith("--target="));
  const target =
    (targetFlag?.split("=")[1] as "neon" | "sheets" | undefined) ?? "neon";

  if (target !== "neon" && target !== "sheets") {
    throw new Error(`Unsupported target "${target}". Use --target=neon or --target=sheets.`);
  }

  return {
    filePath,
    target,
    apply: args.includes("--apply"),
  };
}

function ensureArtifactDirectory(batchId: string) {
  const outputDir = resolve(
    process.cwd(),
    "artifacts",
    "catalog-migration",
    batchId,
  );

  mkdirSync(outputDir, { recursive: true });
  return outputDir;
}

async function main() {
  const options = parseArgs();
  const resolvedPath = resolve(process.cwd(), options.filePath);
  const result = runCatalogPipeline({ filePath: resolvedPath });

  console.info(formatCatalogSummary(result.summary));

  if (!options.apply) {
    console.info(
      `[catalog] Dry run complete for ${options.target}. Re-run with --apply to persist output.`,
    );
    return;
  }

  if (options.target === "neon") {
    const stagingResult = await insertProductMigrationRows(
      result.rows.map(migrationRowToStagingInsert),
    );
    const upsertResult = await upsertNormalizedProducts(result.rows);

    console.info(
      `[catalog] Imported batch ${result.batchId}: staged ${stagingResult.count} rows, upserted ${upsertResult.count} normalized products.`,
    );
    return;
  }

  const outputDir = ensureArtifactDirectory(result.batchId);
  writeFileSync(
    resolve(outputDir, "products.normalized.csv"),
    buildNormalizedSheetsCsv(result.rows),
    "utf8",
  );
  writeFileSync(
    resolve(outputDir, "products.review.csv"),
    buildReviewRowsCsv(result.rows),
    "utf8",
  );
  writeFileSync(
    resolve(outputDir, "review-summary.md"),
    buildReviewSummaryMarkdown({
      batchId: result.batchId,
      summary: result.summary,
    }),
    "utf8",
  );

  console.info(`[catalog] Exported sheets artifacts to ${outputDir}`);
}

main().catch((error) => {
  console.error("[catalog] Product import failed", error);
  process.exit(1);
});
