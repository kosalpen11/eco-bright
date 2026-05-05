import type { ProductCategory } from "@/types/product";
import { getGenericTitlePrefix } from "@/lib/catalog/category-rules";

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeUnitTokens(value: string) {
  return collapseWhitespace(
    value
      .replace(/(\d)\s*w\b/gi, "$1W")
      .replace(/(\d(?:\.\d+)?)\s*m\b/gi, "$1m")
      .replace(/(\d)\s*mm\b/gi, "$1mm")
      .replace(/(\d(?:\.\d+)?)\s*"/g, "$1in")
      .replace(/[–—]+/g, "-"),
  );
}

function normalizeGenericSpecTitle(value: string) {
  return collapseWhitespace(
    normalizeUnitTokens(value)
      .replace(/\s*-\s*/g, " ")
      .replace(/\(([^)]+)\)/g, " $1 ")
      .replace(/\//g, " ")
      .replace(/\s+/g, " "),
  );
}

export function isGenericCatalogTitle(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return true;
  }

  return !/[a-z]{2,}/i.test(normalized.replace(/W|m|mm|in/gi, ""));
}

export function buildTitleFingerprint(value: string) {
  return collapseWhitespace(
    value
      .toLowerCase()
      .replace(/[()]/g, " ")
      .replace(/[^a-z0-9]+/g, " "),
  );
}

export function normalizeTitle(input: {
  title: string;
  category: ProductCategory | null;
}) {
  const rawTitle = collapseWhitespace(input.title);

  if (!rawTitle) {
    return {
      title: null,
      isGeneric: true,
      titleFingerprint: null,
    };
  }

  const isGeneric = isGenericCatalogTitle(rawTitle);
  const normalizedBase = isGeneric
    ? normalizeGenericSpecTitle(rawTitle)
    : normalizeUnitTokens(rawTitle);

  const title =
    isGeneric && input.category
      ? `${getGenericTitlePrefix(input.category)} ${normalizedBase}`
      : normalizedBase;

  return {
    title,
    isGeneric,
    titleFingerprint: buildTitleFingerprint(title),
  };
}
