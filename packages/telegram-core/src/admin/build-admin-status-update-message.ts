import type { AdminStatusUpdateMessageInput } from "./types";

export function buildAdminStatusUpdateMessage(
  input: AdminStatusUpdateMessageInput,
) {
  return [
    `Order updated`,
    `Order ID: ${input.orderId}`,
    `Invoice ID: ${input.invoiceId}`,
    `Action: ${input.action}`,
    `Status: ${input.status}`,
    input.reason ? `Reason: ${input.reason}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
