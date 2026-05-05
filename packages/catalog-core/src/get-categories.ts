import { getActiveProducts } from "../../db/src";

export async function getCatalogCategories() {
  const products = await getActiveProducts();
  const grouped = new Map<string, { id: string; label: string; count: number }>();

  for (const product of products) {
    const existing = grouped.get(product.category);

    if (existing) {
      existing.count += 1;
      continue;
    }

    grouped.set(product.category, {
      id: product.category,
      label: product.categoryLabel,
      count: 1,
    });
  }

  return [...grouped.values()].sort((left, right) => left.label.localeCompare(right.label));
}
