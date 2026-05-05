import type { ProductBadge } from "@/types/product";
import type {
  NormalizedMigrationRow,
  RawMigrationRow,
  ReviewFlag,
  ReviewStatus,
} from "@/types/migration";
import {
  getDefaultCategoryLabel,
  normalizeCategory,
} from "@/lib/catalog/category-rules";
import { normalizeTags } from "@/lib/catalog/normalize-tags";
import { normalizeTitle } from "@/lib/catalog/normalize-title";

const BLOCKING_FLAGS = new Set<ReviewFlag>([
  "missing_id",
  "missing_title",
  "missing_category",
  "missing_description",
  "invalid_price",
  "invalid_old_price",
  "invalid_price3_colors",
  "invalid_pack_qty",
  "invalid_sort_order",
  "invalid_in_stock",
  "invalid_is_active",
  "invalid_currency",
]);

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function parseBooleanInput(value: string, fallback: boolean) {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return { value: fallback, valid: true };
  }

  if (["true", "1", "yes"].includes(normalized)) {
    return { value: true, valid: true };
  }

  if (["false", "0", "no"].includes(normalized)) {
    return { value: false, valid: true };
  }

  return { value: fallback, valid: false };
}

function parseOptionalNumber(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return { value: null, valid: true };
  }

  const parsed = Number(normalized);
  return { value: Number.isFinite(parsed) ? parsed : null, valid: Number.isFinite(parsed) };
}

function parseOptionalPackQty(value: string) {
  const normalized = collapseWhitespace(value);

  if (!normalized) {
    return { value: null, valid: true, raw: null as string | null };
  }

  if (/^\d+$/.test(normalized)) {
    return { value: Number(normalized), valid: true, raw: normalized };
  }

  if (/^\d+(?:\.\d+)?(?:\s*[A-Za-z"]+(?:\s*[*xX]\s*\d+(?:\.\d+)?)?)?$/.test(normalized)) {
    return { value: null, valid: true, raw: normalized };
  }

  return { value: null, valid: false, raw: normalized };
}

function parseRequiredNumber(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return { value: null, valid: false };
  }

  const parsed = Number(normalized);
  return { value: Number.isFinite(parsed) ? parsed : null, valid: Number.isFinite(parsed) };
}

function parseBadge(value: string): ProductBadge | null {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (normalized === "new" || normalized === "hot" || normalized === "sale") {
    return normalized;
  }

  return null;
}

function buildReviewSummary(flags: ReviewFlag[]) {
  if (flags.length === 0) {
    return "ready";
  }

  return flags
    .map((flag) => flag.replace(/_/g, " "))
    .join("; ");
}

export function deriveReviewStatus(flags: ReviewFlag[]): ReviewStatus {
  if (flags.some((flag) => BLOCKING_FLAGS.has(flag))) {
    return "rejected";
  }

  if (flags.length > 0) {
    return "needs_review";
  }

  return "ready";
}

export function normalizeMigrationRow(batchId: string, raw: RawMigrationRow): NormalizedMigrationRow {
  const reviewFlags: ReviewFlag[] = [];

  const normalizedId = raw.id.trim().toLowerCase() || null;
  if (!normalizedId) {
    reviewFlags.push("missing_id");
  }

  const categoryResult = normalizeCategory(raw.proposedCategory);
  if (!categoryResult.category) {
    reviewFlags.push("missing_category");
  } else if (categoryResult.wasRemapped) {
    reviewFlags.push("category_remapped");
  }

  const titleResult = normalizeTitle({
    title: raw.title,
    category: categoryResult.category,
  });
  if (!titleResult.title) {
    reviewFlags.push("missing_title");
  } else if (titleResult.isGeneric) {
    reviewFlags.push("generic_title");
  }

  const normalizedDescription = collapseWhitespace(raw.description);
  if (!normalizedDescription) {
    reviewFlags.push("missing_description");
  }

  const priceResult = parseRequiredNumber(raw.price);
  if (!priceResult.valid || priceResult.value === null || priceResult.value <= 0) {
    reviewFlags.push("invalid_price");
  }

  const oldPriceResult = parseOptionalNumber(raw.oldPrice);
  if (!oldPriceResult.valid) {
    reviewFlags.push("invalid_old_price");
  }

  const alternatePriceResult = parseOptionalNumber(raw.price3Colors);
  if (!alternatePriceResult.valid) {
    reviewFlags.push("invalid_price3_colors");
  } else if (alternatePriceResult.value !== null) {
    reviewFlags.push("alternate_price_present");
  }

  const packQtyResult = parseOptionalPackQty(raw.packQty);
  if (!packQtyResult.valid) {
    reviewFlags.push("invalid_pack_qty");
  }

  const sortOrderResult = parseOptionalNumber(raw.sortOrder);
  if (!sortOrderResult.valid) {
    reviewFlags.push("invalid_sort_order");
  }

  const inStockResult = parseBooleanInput(raw.inStock, true);
  if (!inStockResult.valid) {
    reviewFlags.push("invalid_in_stock");
  }

  const isActiveResult = parseBooleanInput(raw.isActive, true);
  if (!isActiveResult.valid) {
    reviewFlags.push("invalid_is_active");
  }

  const currency = raw.currency.trim().toUpperCase();
  if (currency && currency !== "USD") {
    reviewFlags.push("invalid_currency");
  }

  const normalizedImageUrl = collapseWhitespace(raw.imageUrl) || null;
  if (!normalizedImageUrl) {
    reviewFlags.push("image_missing");
  }

  const normalizedCategory = categoryResult.category;
  const normalizedCategoryLabel =
    normalizedCategory === null
      ? null
      : categoryResult.wasRemapped || !collapseWhitespace(raw.categoryLabel)
        ? getDefaultCategoryLabel(normalizedCategory)
        : collapseWhitespace(raw.categoryLabel);

  const normalizedHoleSize = collapseWhitespace(raw.holeSize) || null;
  const normalizedTags = normalizeTags({
    rawTags: raw.tags,
    packQty: packQtyResult.value,
    rawPackQty: packQtyResult.raw,
    holeSize: normalizedHoleSize,
    hasAlternatePrice: alternatePriceResult.value !== null,
  });

  const normalizedBadge = parseBadge(raw.badge);
  const reviewStatus = deriveReviewStatus(reviewFlags);

  return {
    batchId,
    rowNumber: raw.rowNumber,
    raw,
    normalizedId,
    normalizedTitle: titleResult.title,
    normalizedCategory,
    normalizedCategoryLabel,
    normalizedDescription: normalizedDescription || null,
    normalizedUseCase: collapseWhitespace(raw.useCase) || null,
    normalizedImageUrl,
    normalizedPrice: priceResult.value,
    normalizedOldPrice: oldPriceResult.value,
    normalizedBadge,
    normalizedTags,
    normalizedCurrency: "USD",
    normalizedInStock: inStockResult.value,
    normalizedPackQty: packQtyResult.value,
    normalizedHoleSize,
    normalizedSortOrder: sortOrderResult.value,
    normalizedIsActive: isActiveResult.value,
    rawCategory: collapseWhitespace(raw.proposedCategory),
    alternatePrice: alternatePriceResult.value,
    titleFingerprint: titleResult.titleFingerprint,
    duplicateKey:
      normalizedCategory && titleResult.titleFingerprint && priceResult.value !== null
        ? [
            normalizedCategory,
            titleResult.titleFingerprint,
            packQtyResult.value ?? "",
            normalizedHoleSize ?? "",
            priceResult.value.toFixed(2),
          ].join("|")
        : null,
    nearDuplicateKey:
      normalizedCategory && titleResult.titleFingerprint
        ? `${normalizedCategory}|${titleResult.titleFingerprint}`
        : null,
    reviewStatus,
    reviewFlags,
    reviewSummary: buildReviewSummary(reviewFlags),
  };
}

export function isBlockingReviewFlag(flag: ReviewFlag) {
  return BLOCKING_FLAGS.has(flag);
}
