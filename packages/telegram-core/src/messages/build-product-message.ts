import { getProductTitle, getProductDescription, getProductCategoryLabel } from "../../../../src/lib/i18n";
import type { TelegramProductMessageInput } from "../types";

export function buildProductMessage(input: TelegramProductMessageInput) {
  const title = getProductTitle(input.product, "en");
  const category = getProductCategoryLabel(input.product, "en");
  const description = getProductDescription(input.product, "en");

  return [
    title,
    category,
    "",
    description,
    "",
    `Price: ${input.product.price.toFixed(2)} ${input.product.currency}`,
    `Stock: ${input.product.inStock ? "In stock" : "Out of stock"}`,
    input.quantity ? `Selected quantity: ${input.quantity}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
