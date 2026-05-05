import type { AdminOrderMessageInput } from "./types";

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().replace("T", " ").slice(0, 16);
}

function formatMoney(value: number, currency: string) {
  return `${value.toFixed(2)} ${currency}`;
}

export function buildAdminOrderMessage(input: AdminOrderMessageInput) {
  return [
    `New order review`,
    `${input.shop}`,
    `Order ID: ${input.orderId}`,
    `Invoice ID: ${input.invoiceId}`,
    `Status: ${input.status}`,
    `Source: ${input.source}`,
    `Created: ${formatDate(input.createdAt)}`,
    input.customerName ? `Customer: ${input.customerName}` : null,
    input.customerPhone ? `Phone: ${input.customerPhone}` : null,
    input.note ? `Customer note: ${input.note}` : null,
    input.adminNote ? `Admin note: ${input.adminNote}` : null,
    input.rejectionReason ? `Rejection reason: ${input.rejectionReason}` : null,
    "",
    "Items:",
    ...input.items.flatMap((item) => [
      `• ${item.title}`,
      `  ${item.qty} × ${formatMoney(item.price, input.currency)}`,
      `  Line total: ${formatMoney(item.lineTotal, input.currency)}`,
    ]),
    "",
    `Subtotal: ${formatMoney(input.subtotal, input.currency)}`,
    `Total: ${formatMoney(input.total, input.currency)}`,
  ]
    .filter(Boolean)
    .join("\n");
}
