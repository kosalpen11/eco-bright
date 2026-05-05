import { migrationRowToSheetsRow } from "@/db/mappers/migration-row-to-product";
import { stringifyCsvRows } from "@/lib/catalog/csv";
import type {
  CatalogProfileSummary,
  DuplicateCluster,
  NormalizedMigrationRow,
} from "@/types/migration";

export function formatCatalogSummary(summary: CatalogProfileSummary) {
  return [
    `Source file: ${summary.sourceFile}`,
    `Rows: ${summary.rowCount}`,
    `Ready: ${summary.readyCount}`,
    `Needs review: ${summary.needsReviewCount}`,
    `Rejected: ${summary.rejectedCount}`,
    `Blank images: ${summary.blankImageCount}`,
    `Alternate price rows: ${summary.alternatePriceCount}`,
    `Exact duplicate clusters: ${summary.duplicateExactClusterCount}`,
    `Near duplicate clusters: ${summary.duplicateNearClusterCount}`,
    `Suspicious prices: ${summary.suspiciousPriceCount}`,
  ].join("\n");
}

export function buildNormalizedSheetsCsv(rows: NormalizedMigrationRow[]) {
  const exportedRows = rows
    .filter((row) => row.reviewStatus !== "rejected")
    .map(migrationRowToSheetsRow)
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const headers = [
    "id",
    "title",
    "category",
    "categoryLabel",
    "useCase",
    "description",
    "imageUrl",
    "price",
    "oldPrice",
    "badge",
    "tags",
    "currency",
    "inStock",
    "packQty",
    "holeSize",
    "sortOrder",
    "isActive",
    "needsReview",
    "reviewFlags",
    "reviewSummary",
    "rawCategory",
    "sourceSheet",
    "sourceBlock",
    "sourceRow",
    "sourceSegment",
  ];

  return stringifyCsvRows(headers, exportedRows);
}

export function buildReviewRowsCsv(rows: NormalizedMigrationRow[]) {
  const reviewRows = rows
    .filter((row) => row.reviewStatus !== "ready")
    .map((row) => ({
      rowNumber: row.rowNumber,
      normalizedId: row.normalizedId ?? "",
      rawId: row.raw.id,
      rawTitle: row.raw.title,
      normalizedTitle: row.normalizedTitle ?? "",
      rawCategory: row.raw.proposedCategory,
      normalizedCategory: row.normalizedCategory ?? "",
      price: row.normalizedPrice ?? "",
      alternatePrice: row.alternatePrice ?? "",
      imageUrl: row.normalizedImageUrl ?? "",
      reviewStatus: row.reviewStatus,
      reviewFlags: row.reviewFlags.join(", "),
      reviewSummary: row.reviewSummary,
      sourceSheet: row.raw.sourceSheet,
      sourceBlock: row.raw.sourceBlock,
      sourceRow: row.raw.sourceRow,
      sourceSegment: row.raw.sourceSegment,
    }));

  const headers = [
    "rowNumber",
    "normalizedId",
    "rawId",
    "rawTitle",
    "normalizedTitle",
    "rawCategory",
    "normalizedCategory",
    "price",
    "alternatePrice",
    "imageUrl",
    "reviewStatus",
    "reviewFlags",
    "reviewSummary",
    "sourceSheet",
    "sourceBlock",
    "sourceRow",
    "sourceSegment",
  ];

  return stringifyCsvRows(headers, reviewRows);
}

export function buildDuplicateClustersCsv(clusters: DuplicateCluster[]) {
  const rows = clusters.flatMap((cluster) =>
    cluster.members.map((member) => ({
      clusterKind: cluster.kind,
      clusterKey: cluster.key,
      similarity: cluster.similarity ?? "",
      rowNumber: member.rowNumber,
      id: member.id ?? "",
      title: member.title ?? "",
      category: member.category ?? "",
      price: member.price ?? "",
    })),
  );

  const headers = [
    "clusterKind",
    "clusterKey",
    "similarity",
    "rowNumber",
    "id",
    "title",
    "category",
    "price",
  ];

  return stringifyCsvRows(headers, rows);
}

export function buildCategoryProfileCsv(summary: CatalogProfileSummary) {
  const rows = Object.entries(summary.countsByNormalizedCategory)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, count]) => ({
      category,
      count,
    }));

  return stringifyCsvRows(["category", "count"], rows);
}

export function buildReviewSummaryMarkdown(input: {
  batchId: string;
  summary: CatalogProfileSummary;
}) {
  const summary = input.summary;

  return [
    `# Catalog Review Summary`,
    ``,
    `- Batch: \`${input.batchId}\``,
    `- Source file: \`${summary.sourceFile}\``,
    `- Rows: ${summary.rowCount}`,
    `- Ready: ${summary.readyCount}`,
    `- Needs review: ${summary.needsReviewCount}`,
    `- Rejected: ${summary.rejectedCount}`,
    `- Blank images: ${summary.blankImageCount}`,
    `- Alternate price rows: ${summary.alternatePriceCount}`,
    `- Exact duplicate clusters: ${summary.duplicateExactClusterCount}`,
    `- Near duplicate clusters: ${summary.duplicateNearClusterCount}`,
    `- Suspicious price rows: ${summary.suspiciousPriceCount}`,
    ``,
    `## Review Flags`,
    ...Object.entries(summary.countsByReviewFlag)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([flag, count]) => `- ${flag}: ${count}`),
    ``,
    `## Categories`,
    ...Object.entries(summary.countsByNormalizedCategory)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([category, count]) => `- ${category}: ${count}`),
  ].join("\n");
}
