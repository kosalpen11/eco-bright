import { getActiveProducts, getProductById, getProductByLookupKey } from "../../db/src";

export async function getProduct(input: {
  id?: string;
  lookupKey?: string;
}) {
  if (input.id) {
    return getProductById(input.id);
  }

  if (input.lookupKey) {
    return getProductByLookupKey(input.lookupKey);
  }

  return null;
}

export async function getCatalogProducts() {
  return getActiveProducts();
}
