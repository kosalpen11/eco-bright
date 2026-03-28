import type { Product, ProductFilterValue } from "@/types/product";

interface SearchProductsInput {
  category: ProductFilterValue;
  query: string;
}

export function searchProducts(products: Product[], input: SearchProductsInput) {
  const normalizedQuery = input.query.trim().toLowerCase();

  return products.filter((product) => {
    const matchesCategory =
      input.category === "all" ? true : product.category === input.category;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchBag = [
      product.title,
      product.titleKm,
      product.category,
      product.categoryLabel,
      product.categoryLabelKm,
      product.useCase,
      product.useCaseKm,
      product.description,
      product.descriptionKm,
      ...product.tags,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchBag.includes(normalizedQuery);
  });
}
