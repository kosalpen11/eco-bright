import type {
  CatalogProfileSummary,
  DuplicateCluster,
  NormalizedMigrationRow,
  ReviewFlag,
} from "@/types/migration";
import { buildTitleFingerprint } from "@/lib/catalog/normalize-title";
import { deriveReviewStatus } from "@/lib/catalog/validation";

function buildBigrams(value: string) {
  if (value.length < 2) {
    return [value];
  }

  const bigrams: string[] = [];
  for (let index = 0; index < value.length - 1; index += 1) {
    bigrams.push(value.slice(index, index + 2));
  }
  return bigrams;
}

function similarity(left: string, right: string) {
  if (left === right) {
    return 1;
  }

  const leftBigrams = buildBigrams(left);
  const rightBigrams = buildBigrams(right);
  const rightPool = new Map<string, number>();

  rightBigrams.forEach((value) => {
    rightPool.set(value, (rightPool.get(value) ?? 0) + 1);
  });

  let matches = 0;
  leftBigrams.forEach((value) => {
    const count = rightPool.get(value) ?? 0;
    if (count > 0) {
      matches += 1;
      rightPool.set(value, count - 1);
    }
  });

  return (2 * matches) / (leftBigrams.length + rightBigrams.length);
}

function quantile(values: number[], ratio: number) {
  if (values.length === 0) {
    return 0;
  }

  const position = (values.length - 1) * ratio;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);

  if (lowerIndex === upperIndex) {
    return values[lowerIndex];
  }

  const weight = position - lowerIndex;
  return values[lowerIndex] * (1 - weight) + values[upperIndex] * weight;
}

function buildExactDuplicateClusters(rows: NormalizedMigrationRow[]) {
  const groups = new Map<string, NormalizedMigrationRow[]>();

  rows.forEach((row) => {
    const sourceCategoryFingerprint = buildTitleFingerprint(row.raw.proposedCategory);
    const sourceTitleFingerprint = buildTitleFingerprint(row.raw.title);

    if (!sourceCategoryFingerprint || !sourceTitleFingerprint) {
      return;
    }

    const exactTitleKey = `${sourceCategoryFingerprint}|${sourceTitleFingerprint}`;
    const group = groups.get(exactTitleKey) ?? [];
    group.push(row);
    groups.set(exactTitleKey, group);
  });

  return Array.from(groups.entries())
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => ({
      kind: "exact" as const,
      key,
      members: group.map((row) => ({
        rowNumber: row.rowNumber,
        id: row.normalizedId,
        title: row.normalizedTitle,
        category: row.normalizedCategory,
        price: row.normalizedPrice,
      })),
    }));
}

function buildNearDuplicateClusters(rows: NormalizedMigrationRow[]) {
  const clusters: DuplicateCluster[] = [];
  const groupedRows = new Map<string, NormalizedMigrationRow[]>();

  rows.forEach((row) => {
    if (!row.normalizedCategory || !row.titleFingerprint) {
      return;
    }

    const key = row.normalizedCategory;
    const group = groupedRows.get(key) ?? [];
    group.push(row);
    groupedRows.set(key, group);
  });

  groupedRows.forEach((group, category) => {
    const visited = new Set<number>();

    group.forEach((row, index) => {
      if (visited.has(index)) {
        return;
      }

      const component = [index];
      visited.add(index);

      for (let innerIndex = index + 1; innerIndex < group.length; innerIndex += 1) {
        if (visited.has(innerIndex)) {
          continue;
        }

        const other = group[innerIndex];

        if (
          row.duplicateKey &&
          other.duplicateKey &&
          row.duplicateKey === other.duplicateKey
        ) {
          continue;
        }

        if (
          row.titleFingerprint &&
          other.titleFingerprint &&
          row.titleFingerprint === other.titleFingerprint
        ) {
          continue;
        }

        const score = similarity(
          row.titleFingerprint ?? "",
          other.titleFingerprint ?? "",
        );

        if (score >= 0.9) {
          component.push(innerIndex);
          visited.add(innerIndex);
        }
      }

      if (component.length > 1) {
        const members = component.map((memberIndex) => group[memberIndex]);
        const clusterKey = `${category}|${members
          .map((member) => member.normalizedId ?? member.rowNumber)
          .join("-")}`;

        clusters.push({
          kind: "near",
          key: clusterKey,
          similarity: Math.min(
            ...members
              .slice(1)
              .map((member) =>
                similarity(
                  members[0].titleFingerprint ?? "",
                  member.titleFingerprint ?? "",
                ),
              ),
          ),
          members: members.map((member) => ({
            rowNumber: member.rowNumber,
            id: member.normalizedId,
            title: member.normalizedTitle,
            category: member.normalizedCategory,
            price: member.normalizedPrice,
          })),
        });
      }
    });
  });

  return clusters;
}

function buildPriceOutlierKeys(rows: NormalizedMigrationRow[]) {
  const outlierKeys = new Set<number>();
  const rowsByCategory = new Map<string, NormalizedMigrationRow[]>();

  rows.forEach((row) => {
    if (!row.normalizedCategory || row.normalizedPrice === null) {
      return;
    }

    const group = rowsByCategory.get(row.normalizedCategory) ?? [];
    group.push(row);
    rowsByCategory.set(row.normalizedCategory, group);
  });

  rowsByCategory.forEach((group) => {
    const prices = group
      .map((row) => row.normalizedPrice)
      .filter((value): value is number => value !== null)
      .sort((left, right) => left - right);

    if (prices.length < 4) {
      return;
    }

    const q1 = quantile(prices, 0.25);
    const q3 = quantile(prices, 0.75);
    const iqr = q3 - q1;
    const lower = Math.max(0.01, q1 - 1.5 * iqr);
    const upper = q3 + 3 * iqr;

    group.forEach((row) => {
      if (row.normalizedPrice === null) {
        return;
      }

      if (row.normalizedPrice < lower || row.normalizedPrice > upper || row.normalizedPrice > 1000) {
        outlierKeys.add(row.rowNumber);
      }
    });
  });

  return outlierKeys;
}

function increment(target: Record<string, number>, key: string) {
  target[key] = (target[key] ?? 0) + 1;
}

export function analyzeCatalogRows(input: {
  rows: NormalizedMigrationRow[];
  sourceFile: string;
}) {
  const exactDuplicates = buildExactDuplicateClusters(input.rows);
  const nearDuplicates = buildNearDuplicateClusters(input.rows);
  const suspiciousPriceRows = buildPriceOutlierKeys(input.rows);

  const exactDuplicateRowSet = new Set(
    exactDuplicates.flatMap((cluster) => cluster.members.map((member) => member.rowNumber)),
  );
  const nearDuplicateRowSet = new Set(
    nearDuplicates.flatMap((cluster) => cluster.members.map((member) => member.rowNumber)),
  );

  const rows = input.rows.map((row) => {
    const flags = new Set<ReviewFlag>(row.reviewFlags);

    if (exactDuplicateRowSet.has(row.rowNumber)) {
      flags.add("duplicate_exact");
    }

    if (nearDuplicateRowSet.has(row.rowNumber)) {
      flags.add("duplicate_near");
    }

    if (suspiciousPriceRows.has(row.rowNumber)) {
      flags.add("suspicious_price");
    }

    const reviewFlags = Array.from(flags.values()).sort();

    return {
      ...row,
      reviewFlags,
      reviewStatus: deriveReviewStatus(reviewFlags),
      reviewSummary: reviewFlags.length
        ? reviewFlags.map((flag) => flag.replace(/_/g, " ")).join("; ")
        : "ready",
    };
  });

  const countsBySourceCategory: Record<string, number> = {};
  const countsByNormalizedCategory: Record<string, number> = {};
  const countsByReviewFlag: Record<string, number> = {};
  const missingCriticalFieldCounts: Record<string, number> = {
    id: 0,
    title: 0,
    category: 0,
    price: 0,
    description: 0,
  };

  let readyCount = 0;
  let needsReviewCount = 0;
  let rejectedCount = 0;
  let blankImageCount = 0;
  let alternatePriceCount = 0;

  rows.forEach((row) => {
    increment(countsBySourceCategory, row.raw.proposedCategory || "(blank)");
    increment(countsByNormalizedCategory, row.normalizedCategory ?? "(unmapped)");
    row.reviewFlags.forEach((flag) => increment(countsByReviewFlag, flag));

    if (row.reviewStatus === "ready") {
      readyCount += 1;
    } else if (row.reviewStatus === "needs_review") {
      needsReviewCount += 1;
    } else {
      rejectedCount += 1;
    }

    if (row.reviewFlags.includes("image_missing")) {
      blankImageCount += 1;
    }

    if (row.reviewFlags.includes("alternate_price_present")) {
      alternatePriceCount += 1;
    }

    if (row.reviewFlags.includes("missing_id")) {
      missingCriticalFieldCounts.id += 1;
    }
    if (row.reviewFlags.includes("missing_title")) {
      missingCriticalFieldCounts.title += 1;
    }
    if (row.reviewFlags.includes("missing_category")) {
      missingCriticalFieldCounts.category += 1;
    }
    if (row.reviewFlags.includes("invalid_price")) {
      missingCriticalFieldCounts.price += 1;
    }
    if (row.reviewFlags.includes("missing_description")) {
      missingCriticalFieldCounts.description += 1;
    }
  });

  const summary: CatalogProfileSummary = {
    sourceFile: input.sourceFile,
    rowCount: rows.length,
    readyCount,
    needsReviewCount,
    rejectedCount,
    blankImageCount,
    alternatePriceCount,
    duplicateExactClusterCount: exactDuplicates.length,
    duplicateNearClusterCount: nearDuplicates.length,
    suspiciousPriceCount: suspiciousPriceRows.size,
    countsBySourceCategory,
    countsByNormalizedCategory,
    countsByReviewFlag,
    missingCriticalFieldCounts,
  };

  return {
    rows,
    exactDuplicates,
    nearDuplicates,
    summary,
  };
}
