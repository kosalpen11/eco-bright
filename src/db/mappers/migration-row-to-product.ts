import type { ProductInsert, ProductMigrationRowInsert } from "@/db/schema";
import type { NormalizedMigrationRow, NormalizedSheetsRow } from "@/types/migration";

export function migrationRowToStagingInsert(
  row: NormalizedMigrationRow,
): ProductMigrationRowInsert {
  return {
    batchId: row.batchId,
    inputRowNumber: row.rowNumber,
    rawId: row.raw.id || null,
    rawTitle: row.raw.title || null,
    rawProposedCategory: row.raw.proposedCategory || null,
    rawCategoryLabel: row.raw.categoryLabel || null,
    rawStorefrontFallbackCategory: row.raw.storefrontFallbackCategory || null,
    rawUseCase: row.raw.useCase || null,
    rawDescription: row.raw.description || null,
    rawImageUrl: row.raw.imageUrl || null,
    rawPrice: row.raw.price || null,
    rawOldPrice: row.raw.oldPrice || null,
    rawBadge: row.raw.badge || null,
    rawTags: row.raw.tags || null,
    rawCurrency: row.raw.currency || null,
    rawInStock: row.raw.inStock || null,
    rawPackQty: row.raw.packQty || null,
    rawHoleSize: row.raw.holeSize || null,
    rawPrice3Colors: row.raw.price3Colors || null,
    rawSortOrder: row.raw.sortOrder || null,
    rawIsActive: row.raw.isActive || null,
    rawNeedsReview: row.raw.needsReview || null,
    rawReviewNote: row.raw.reviewNote || null,
    sourceSheet: row.raw.sourceSheet || null,
    sourceBlock: row.raw.sourceBlock || null,
    sourceRow: row.raw.sourceRow || null,
    sourceSegment: row.raw.sourceSegment || null,
    normalizedId: row.normalizedId,
    normalizedTitle: row.normalizedTitle,
    normalizedCategory: row.normalizedCategory,
    normalizedCategoryLabel: row.normalizedCategoryLabel,
    normalizedUseCase: row.normalizedUseCase,
    normalizedDescription: row.normalizedDescription,
    normalizedImageUrl: row.normalizedImageUrl,
    normalizedPrice: row.normalizedPrice,
    normalizedOldPrice: row.normalizedOldPrice,
    normalizedTags: row.normalizedTags,
    normalizedPackQty: row.normalizedPackQty,
    normalizedHoleSize: row.normalizedHoleSize,
    reviewStatus: row.reviewStatus,
    reviewFlags: row.reviewFlags,
    reviewSummary: row.reviewSummary,
    titleFingerprint: row.titleFingerprint,
    duplicateKey: row.duplicateKey,
    nearDuplicateKey: row.nearDuplicateKey,
  };
}

export function migrationRowToProductInsert(row: NormalizedMigrationRow): ProductInsert {
  if (
    !row.normalizedId ||
    !row.normalizedTitle ||
    !row.normalizedCategory ||
    !row.normalizedCategoryLabel ||
    !row.normalizedDescription ||
    row.normalizedPrice === null
  ) {
    throw new Error(`Row ${row.rowNumber} is not ready for product upsert.`);
  }

  return {
    id: row.normalizedId,
    brand: "ecobright",
    title: row.normalizedTitle,
    titleKm: null,
    category: row.normalizedCategory,
    categoryLabel: row.normalizedCategoryLabel,
    categoryLabelKm: null,
    useCase: row.normalizedUseCase,
    useCaseKm: null,
    description: row.normalizedDescription,
    descriptionKm: null,
    imageUrl: row.normalizedImageUrl,
    imageUrls: row.normalizedImageUrl ? [row.normalizedImageUrl] : null,
    price: row.normalizedPrice,
    oldPrice: row.normalizedOldPrice,
    badge: row.normalizedBadge,
    tags: row.normalizedTags,
    currency: row.normalizedCurrency,
    inStock: row.normalizedInStock,
    sortOrder: row.normalizedSortOrder ?? row.rowNumber,
    isActive: row.normalizedIsActive,
    rating: null,
    createdOrder: row.rowNumber,
    rawCategory: row.rawCategory,
    packQty: row.normalizedPackQty,
    holeSize: row.normalizedHoleSize,
    sourceSheet: row.raw.sourceSheet || null,
    sourceBlock: row.raw.sourceBlock || null,
    sourceRow: row.raw.sourceRow || null,
    sourceSegment: row.raw.sourceSegment || null,
    needsReview: row.reviewStatus !== "ready",
    reviewFlags: row.reviewFlags,
    migrationBatchId: row.batchId,
    updatedAt: new Date(),
  };
}

export function migrationRowToSheetsRow(row: NormalizedMigrationRow): NormalizedSheetsRow | null {
  if (
    !row.normalizedId ||
    !row.normalizedTitle ||
    !row.normalizedCategory ||
    !row.normalizedCategoryLabel ||
    !row.normalizedDescription ||
    row.normalizedPrice === null
  ) {
    return null;
  }

  return {
    id: row.normalizedId,
    title: row.normalizedTitle,
    category: row.normalizedCategory,
    categoryLabel: row.normalizedCategoryLabel,
    useCase: row.normalizedUseCase ?? "",
    description: row.normalizedDescription,
    imageUrl: row.normalizedImageUrl ?? "",
    price: row.normalizedPrice,
    oldPrice: row.normalizedOldPrice ?? "",
    badge: row.normalizedBadge ?? "",
    tags: row.normalizedTags.join(", "),
    currency: row.normalizedCurrency,
    inStock: row.normalizedInStock,
    packQty: row.normalizedPackQty ?? "",
    holeSize: row.normalizedHoleSize ?? "",
    sortOrder: row.normalizedSortOrder ?? "",
    isActive: row.normalizedIsActive,
    needsReview: row.reviewStatus !== "ready",
    reviewFlags: row.reviewFlags.join(", "),
    reviewSummary: row.reviewSummary,
    rawCategory: row.rawCategory,
    sourceSheet: row.raw.sourceSheet,
    sourceBlock: row.raw.sourceBlock,
    sourceRow: row.raw.sourceRow,
    sourceSegment: row.raw.sourceSegment,
  };
}
