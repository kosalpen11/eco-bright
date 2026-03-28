import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { upsertProducts } from "../src/db/queries/products";
import {
  PRODUCT_CATEGORIES,
  type Product,
  type ProductBadge,
  type ProductCategory,
} from "../src/types/product";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

const VALID_CATEGORIES = new Set<ProductCategory>(
  PRODUCT_CATEGORIES.map((category) => category.value),
);

function parseCsvRows(input: string) {
  const rows: string[][] = [];
  let currentCell = "";
  let currentRow: string[] = [];
  let insideQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        index += 1;
        continue;
      }

      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      currentRow.push(currentCell);
      rows.push(currentRow);
      currentCell = "";
      currentRow = [];
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((cell) => cell.trim() !== ""));
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBoolean(value: string, fallback: boolean) {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return fallback;
  }

  if (["true", "1", "yes"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function parseBadge(value: string): ProductBadge | undefined {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  if (normalized === "new" || normalized === "hot" || normalized === "sale") {
    return normalized;
  }

  return undefined;
}

function toObjectRows(rows: string[][]) {
  const [headerRow, ...dataRows] = rows;

  if (!headerRow) {
    throw new Error("CSV file is missing a header row.");
  }

  const headers = headerRow.map((header) => header.trim());

  return dataRows.map((row) =>
    headers.reduce<Record<string, string>>((accumulator, header, index) => {
      accumulator[header] = row[index]?.trim() ?? "";
      return accumulator;
    }, {}),
  );
}

function normalizeCsvRow(row: Record<string, string>, rowNumber: number): Product {
  const category = row.category.trim() as ProductCategory;

  if (!VALID_CATEGORIES.has(category)) {
    throw new Error(`Row ${rowNumber}: invalid category "${row.category}".`);
  }

  const price = parseOptionalNumber(row.price);

  if (!row.id.trim()) {
    throw new Error(`Row ${rowNumber}: missing id.`);
  }

  if (!row.title.trim()) {
    throw new Error(`Row ${rowNumber}: missing title.`);
  }

  if (!row.categoryLabel.trim()) {
    throw new Error(`Row ${rowNumber}: missing categoryLabel.`);
  }

  if (!row.description.trim()) {
    throw new Error(`Row ${rowNumber}: missing description.`);
  }

  if (!row.imageUrl.trim()) {
    throw new Error(`Row ${rowNumber}: missing imageUrl.`);
  }

  if (price === undefined) {
    throw new Error(`Row ${rowNumber}: invalid price.`);
  }

  return {
    id: row.id.trim(),
    title: row.title.trim(),
    titleKm: row.titleKm?.trim() || undefined,
    category,
    categoryLabel: row.categoryLabel.trim(),
    categoryLabelKm: row.categoryLabelKm?.trim() || undefined,
    useCase: row.useCase?.trim() || undefined,
    useCaseKm: row.useCaseKm?.trim() || undefined,
    description: row.description.trim(),
    descriptionKm: row.descriptionKm?.trim() || undefined,
    imageUrl: row.imageUrl.trim(),
    price,
    oldPrice: parseOptionalNumber(row.oldPrice ?? "") ?? null,
    badge: parseBadge(row.badge ?? ""),
    tags: (row.tags ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    currency: "USD",
    inStock: parseBoolean(row.inStock ?? "", true),
    sortOrder: parseOptionalNumber(row.sortOrder ?? ""),
    isActive: parseBoolean(row.isActive ?? "", true),
    rating: parseOptionalNumber(row.rating ?? ""),
    createdOrder: parseOptionalNumber(row.createdOrder ?? "") ?? rowNumber,
  };
}

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    throw new Error("Usage: npm run import:products:csv -- ./path/to/products.csv");
  }

  const resolvedPath = resolve(process.cwd(), filePath);
  const rawRows = toObjectRows(parseCsvRows(readFileSync(resolvedPath, "utf8")));

  const products: Product[] = [];
  const invalidRows: string[] = [];

  rawRows.forEach((row, index) => {
    try {
      products.push(normalizeCsvRow(row, index + 2));
    } catch (error) {
      invalidRows.push(error instanceof Error ? error.message : `Row ${index + 2}: invalid row.`);
    }
  });

  if (invalidRows.length) {
    console.error("[neon] Skipping invalid CSV rows:");
    invalidRows.forEach((message) => console.error(`- ${message}`));
  }

  const result = await upsertProducts(products);
  console.info(`[neon] Imported ${result.count} products from CSV.`);
}

main().catch((error) => {
  console.error("[neon] CSV import failed", error);
  process.exit(1);
});
