import { getProductByLookupKey } from "../../db/src";
import { parseProductLink } from "../../../src/lib/ordering/parse-product-link";

export async function resolveProductLink(url: string) {
  const parsed = parseProductLink(url);
  const product = await getProductByLookupKey(parsed.lookupKey);

  return {
    ...parsed,
    product,
  };
}
