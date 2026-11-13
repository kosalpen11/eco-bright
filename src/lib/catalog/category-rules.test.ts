import test from "node:test";
import assert from "node:assert/strict";
import {
  getDefaultCategoryLabel,
  normalizeCategory,
} from "@/lib/catalog/category-rules";

test("normalizeCategory remaps legacy storefront categories", () => {
  assert.deepEqual(normalizeCategory("street-lights"), {
    category: "solar-street-lights",
    wasRemapped: true,
  });
  assert.deepEqual(normalizeCategory("solar-panels"), {
    category: "solar-systems",
    wasRemapped: true,
  });
  assert.deepEqual(normalizeCategory("batteries"), {
    category: "solar-systems",
    wasRemapped: true,
  });
  // Shop category since the Nov 2026 cleanup: kept as-is, not remapped.
  assert.deepEqual(normalizeCategory("accessories"), {
    category: "accessories",
    wasRemapped: false,
  });
});

test("getDefaultCategoryLabel returns stable singular labels", () => {
  assert.equal(
    getDefaultCategoryLabel("drivers-accessories"),
    "Driver / Accessory",
  );
  assert.equal(getDefaultCategoryLabel("wire-cables"), "Wire / Cable");
});
