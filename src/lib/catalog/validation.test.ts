import test from "node:test";
import assert from "node:assert/strict";
import { normalizeMigrationRow } from "@/lib/catalog/validation";
import type { RawMigrationRow } from "@/types/migration";

function createRawRow(overrides: Partial<RawMigrationRow> = {}): RawMigrationRow {
  return {
    rowNumber: 2,
    id: "grace_001",
    title: "10W-0.6M",
    proposedCategory: "led-tubes",
    categoryLabel: "LED Tube",
    storefrontFallbackCategory: "led-tubes",
    useCase: "General Lighting",
    description: "LED Tube 10W-0.6M from GRACE price sheet.",
    imageUrl: "",
    price: "0.6",
    oldPrice: "",
    badge: "",
    tags: "Tube,Pack:30",
    currency: "USD",
    inStock: "TRUE",
    packQty: "30",
    holeSize: "",
    price3Colors: "",
    sortOrder: "1",
    isActive: "TRUE",
    needsReview: "TRUE",
    reviewNote: "imageUrl missing",
    sourceSheet: "Table 1",
    sourceBlock: "10",
    sourceRow: "11",
    sourceSegment: "1",
    ...overrides,
  };
}

test("normalizeMigrationRow keeps blank image rows importable but flagged", () => {
  const row = normalizeMigrationRow("batch_1", createRawRow());

  assert.equal(row.reviewStatus, "needs_review");
  assert.equal(row.normalizedImageUrl, null);
  assert.ok(row.reviewFlags.includes("image_missing"));
});

test("normalizeMigrationRow flags alternate prices without replacing primary price", () => {
  const row = normalizeMigrationRow(
    "batch_1",
    createRawRow({
      proposedCategory: "downlights",
      title: "6W",
      price3Colors: "1.05",
    }),
  );

  assert.equal(row.normalizedPrice, 0.6);
  assert.equal(row.alternatePrice, 1.05);
  assert.ok(row.reviewFlags.includes("alternate_price_present"));
});

test("normalizeMigrationRow remaps legacy categories and flags them", () => {
  const row = normalizeMigrationRow(
    "batch_1",
    createRawRow({
      proposedCategory: "solar-lights",
      title: "50W",
    }),
  );

  assert.equal(row.normalizedCategory, "solar-flood-lights");
  assert.ok(row.reviewFlags.includes("category_remapped"));
});

test("normalizeMigrationRow keeps structured pack specs importable and preserves them as tags", () => {
  const row = normalizeMigrationRow(
    "batch_1",
    createRawRow({
      proposedCategory: "string-lights",
      title: "2P-96D-WHITE",
      packQty: "100M",
      tags: "",
    }),
  );

  assert.equal(row.reviewStatus, "needs_review");
  assert.equal(row.normalizedPackQty, null);
  assert.ok(!row.reviewFlags.includes("invalid_pack_qty"));
  assert.ok(row.normalizedTags.includes("Pack:100M"));
});
