import type { OrderRecord } from "../../../../src/types/order";

export function buildCustomerStatusMessage(input: {
  order: Pick<OrderRecord, "invoiceId" | "status" | "shop">;
  customText?: string | null;
}) {
  return [
    `${input.order.shop}`,
    `Invoice ID: ${input.order.invoiceId}`,
    `Status: ${input.order.status}`,
    input.customText?.trim() || null,
  ]
    .filter(Boolean)
    .join("\n");
}
