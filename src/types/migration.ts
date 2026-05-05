import type { ProductBadge, ProductCategory } from "@/types/product";

export type ReviewStatus = "ready" | "needs_review" | "rejected";

export type ReviewFlag =
  | "missing_id"
  | "missing_title"
  | "missing_category"
  | "missing_description"
  | "invalid_price"
  | "invalid_old_price"
  | "invalid_price3_colors"
  | "invalid_pack_qty"
  | "invalid_sort_order"
  | "invalid_in_stock"
  | "invalid_is_active"
  | "invalid_currency"
  | "image_missing"
  | "category_remapped"
  | "alternate_price_present"
  | "duplicate_exact"
  | "duplicate_near"
  | "generic_title"
  | "suspicious_price";

export interface RawMigrationRow {
  rowNumber: number;
  id: string;
  title: string;
  proposedCategory: string;
  categoryLabel: string;
  storefrontFallbackCategory: string;
  useCase: string;
  description: string;
  imageUrl: string;
  price: string;
  oldPrice: string;
  badge: string;
  tags: string;
  currency: string;
  inStock: string;
  packQty: string;
  holeSize: string;
  price3Colors: string;
  sortOrder: string;
  isActive: string;
  needsReview: string;
  reviewNote: string;
  sourceSheet: string;
  sourceBlock: string;
  sourceRow: string;
  sourceSegment: string;
}

export interface DuplicateClusterMember {
  rowNumber: number;
  id: string | null;
  title: string | null;
  category: ProductCategory | null;
  price: number | null;
}

export interface DuplicateCluster {
  kind: "exact" | "near";
  key: string;
  similarity?: number;
  members: DuplicateClusterMember[];
}

export interface NormalizedMigrationRow {
  batchId: string;
  rowNumber: number;
  raw: RawMigrationRow;
  normalizedId: string | null;
  normalizedTitle: string | null;
  normalizedCategory: ProductCategory | null;
  normalizedCategoryLabel: string | null;
  normalizedDescription: string | null;
  normalizedUseCase: string | null;
  normalizedImageUrl: string | null;
  normalizedPrice: number | null;
  normalizedOldPrice: number | null;
  normalizedBadge: ProductBadge | null;
  normalizedTags: string[];
  normalizedCurrency: "USD";
  normalizedInStock: boolean;
  normalizedPackQty: number | null;
  normalizedHoleSize: string | null;
  normalizedSortOrder: number | null;
  normalizedIsActive: boolean;
  rawCategory: string;
  alternatePrice: number | null;
  titleFingerprint: string | null;
  duplicateKey: string | null;
  nearDuplicateKey: string | null;
  reviewStatus: ReviewStatus;
  reviewFlags: ReviewFlag[];
  reviewSummary: string;
}

export interface CatalogProfileSummary {
  sourceFile: string;
  rowCount: number;
  readyCount: number;
  needsReviewCount: number;
  rejectedCount: number;
  blankImageCount: number;
  alternatePriceCount: number;
  duplicateExactClusterCount: number;
  duplicateNearClusterCount: number;
  suspiciousPriceCount: number;
  countsBySourceCategory: Record<string, number>;
  countsByNormalizedCategory: Record<string, number>;
  countsByReviewFlag: Record<string, number>;
  missingCriticalFieldCounts: Record<string, number>;
}

export interface NormalizedSheetsRow {
  id: string;
  title: string;
  category: ProductCategory;
  categoryLabel: string;
  useCase: string;
  description: string;
  imageUrl: string;
  price: number;
  oldPrice: number | "";
  badge: ProductBadge | "";
  tags: string;
  currency: "USD";
  inStock: boolean;
  packQty: number | "";
  holeSize: string;
  sortOrder: number | "";
  isActive: boolean;
  needsReview: boolean;
  reviewFlags: string;
  reviewSummary: string;
  rawCategory: string;
  sourceSheet: string;
  sourceBlock: string;
  sourceRow: string;
  sourceSegment: string;
}
