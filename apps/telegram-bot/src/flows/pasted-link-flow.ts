import { resolveProductLink } from "../../../../packages/catalog-core/src";
import { startProductPurchase } from "./purchase-flow";

export async function startPastedLinkOrder(url: string) {
  const resolved = await resolveProductLink(url);

  if (!resolved.product) {
    throw new Error("No matching product was found for that link.");
  }

  return startProductPurchase({
    productId: resolved.product.id,
    source: "pasted-link",
  });
}
