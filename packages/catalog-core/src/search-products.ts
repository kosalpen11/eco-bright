import { getActiveProducts } from "../../db/src";
import { searchProducts } from "../../../src/lib/search-products";
import type { ProductFilterValue } from "../../../src/types/product";

export async function searchCatalogProducts(input: {
  query: string;
  category?: ProductFilterValue;
}) {
  const products = await getActiveProducts();

  return searchProducts(products, {
    query: input.query,
    category: input.category ?? "all",
  });
}
