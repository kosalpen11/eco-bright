import test from "node:test";
import assert from "node:assert/strict";
import { analyzeCatalogRows } from "@/lib/catalog/analytics";
import { normalizeMigrationRow } from "@/lib/catalog/validation";
import type { RawMigrationRow } from "@/types/migration";

function createRawRow(overrides: Partial<RawMigrationRow> = {}): RawMigrationRow {
  return {
    rowNumber: 2,
    id: "grace_001",
    title: "100W",
    proposedCategory: "flood-lights",
    categoryLabel: "Flood Light",
    storefrontFallbackCategory: "flood-lights",
    useCase: "Outdoor",
    description: "Flood light from the GRACE migration sheet.",
    imageUrl: "",
    price: "10",
    oldPrice: "",
    badge: "",
    tags: "",
    currency: "USD",
    inStock: "TRUE",
    packQty: "1",
    holeSize: "",
    price3Colors: "",
    sortOrder: "1",
    isActive: "TRUE",
    needsReview: "TRUE",
    reviewNote: "",
    sourceSheet: "Table 1",
    sourceBlock: "1",
    sourceRow: "1",
    sourceSegment: "1",
    ...overrides,
  };
}

test("analyzeCatalogRows flags exact duplicate title groups within a category", () => {
  const rows = [
    normalizeMigrationRow(
      "batch_1",
      createRawRow({
        rowNumber: 2,
        id: "grace_001",
        title: "100W",
        price: "10",
      }),
    ),
    normalizeMigrationRow(
      "batch_1",
      createRawRow({
        rowNumber: 3,
        id: "grace_002",
        title: "100W",
        price: "12",
      }),
    ),
  ];

  const analysis = analyzeCatalogRows({
    rows,
    sourceFile: "fixtures.csv",
  });

  assert.equal(analysis.exactDuplicates.length, 1);
  assert.equal(analysis.summary.duplicateExactClusterCount, 1);
  assert.ok(
    analysis.rows.every((row) => row.reviewFlags.includes("duplicate_exact")),
  );
});
