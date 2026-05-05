import type { TelegramOrderSummaryInput } from "../types";

export function buildOrderSummaryMessage(input: TelegramOrderSummaryInput) {
  return [
    `Order received for ${input.shop}`,
    `Order ID: ${input.orderId}`,
    `Invoice ID: ${input.invoiceId}`,
    "",
    ...input.items.flatMap((item) => [
      `• ${item.title}`,
      `  ${item.qty} × ${item.price.toFixed(2)} ${input.currency}`,
      `  Line total: ${item.lineTotal.toFixed(2)} ${input.currency}`,
    ]),
    "",
    `Subtotal: ${input.subtotal.toFixed(2)} ${input.currency}`,
    `Total: ${input.total.toFixed(2)} ${input.currency}`,
    input.customerName ? `Name: ${input.customerName}` : null,
    input.customerPhone ? `Phone: ${input.customerPhone}` : null,
    input.note ? `Note: ${input.note}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
