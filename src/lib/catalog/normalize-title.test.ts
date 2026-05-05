import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTitle } from "@/lib/catalog/normalize-title";

test("normalizeTitle prefixes generic tube titles", () => {
  const result = normalizeTitle({
    title: "10W-0.6M",
    category: "led-tubes",
  });

  assert.equal(result.title, "LED Tube 10W 0.6m");
  assert.equal(result.isGeneric, true);
});

test("normalizeTitle preserves model-style accessory titles", () => {
  const result = normalizeTitle({
    title: "D-DYT-50",
    category: "drivers-accessories",
  });

  assert.equal(result.title, "D-DYT-50");
  assert.equal(result.isGeneric, false);
});
