import { readFileSync } from "node:fs";
import { basename } from "node:path";
import type {
  CatalogProfileSummary,
  DuplicateCluster,
  NormalizedMigrationRow,
  RawMigrationRow,
} from "@/types/migration";
import { analyzeCatalogRows } from "@/lib/catalog/analytics";
import { parseCsvRows, toObjectRows } from "@/lib/catalog/csv";
import { normalizeMigrationRow } from "@/lib/catalog/validation";

interface PipelineResult {
  sourceFile: string;
  batchId: string;
  rawRows: RawMigrationRow[];
  rows: NormalizedMigrationRow[];
  summary: CatalogProfileSummary;
  exactDuplicates: DuplicateCluster[];
  nearDuplicates: DuplicateCluster[];
}

function toRawMigrationRows(objectRows: Array<Record<string, string>>): RawMigrationRow[] {
  return objectRows.map((row, index) => ({
    rowNumber: index + 2,
    id: row.id ?? "",
    title: row.title ?? "",
    proposedCategory: row.proposedCategory ?? "",
    categoryLabel: row.categoryLabel ?? "",
    storefrontFallbackCategory: row.storefrontFallbackCategory ?? "",
    useCase: row.useCase ?? "",
    description: row.description ?? "",
    imageUrl: row.imageUrl ?? "",
    price: row.price ?? "",
    oldPrice: row.oldPrice ?? "",
    badge: row.badge ?? "",
    tags: row.tags ?? "",
    currency: row.currency ?? "",
    inStock: row.inStock ?? "",
    packQty: row.packQty ?? "",
    holeSize: row.holeSize ?? "",
    price3Colors: row.price3Colors ?? "",
    sortOrder: row.sortOrder ?? "",
    isActive: row.isActive ?? "",
    needsReview: row.needsReview ?? "",
    reviewNote: row.reviewNote ?? "",
    sourceSheet: row.sourceSheet ?? "",
    sourceBlock: row.sourceBlock ?? "",
    sourceRow: row.sourceRow ?? "",
    sourceSegment: row.sourceSegment ?? "",
  }));
}

export function createMigrationBatchId(date = new Date()) {
  const iso = date.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  return `catalog_${iso}`;
}

export function runCatalogPipeline(input: {
  filePath: string;
  batchId?: string;
}): PipelineResult {
  const sourceFile = basename(input.filePath);
  const batchId = input.batchId ?? createMigrationBatchId();
  const rawContent = readFileSync(input.filePath, "utf8");
  const rawRows = toRawMigrationRows(
    toObjectRows<Record<string, string>>(parseCsvRows(rawContent)),
  );
  const normalizedRows = rawRows.map((row) => normalizeMigrationRow(batchId, row));
  const analytics = analyzeCatalogRows({
    rows: normalizedRows,
    sourceFile,
  });

  return {
    sourceFile,
    batchId,
    rawRows,
    rows: analytics.rows,
    summary: analytics.summary,
    exactDuplicates: analytics.exactDuplicates,
    nearDuplicates: analytics.nearDuplicates,
  };
}
