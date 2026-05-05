import { applyAdminOrderAction, buildAdminAuditNote } from "./_shared";
import type { AdminOrderActionInput } from "./types";

export async function cancelOrder(input: AdminOrderActionInput) {
  const note = buildAdminAuditNote({
    actor: input.actor,
    text: input.reason
      ? `Cancelled order. ${input.reason.trim()}`
      : "Cancelled order.",
  });

  return applyAdminOrderAction({
    orderId: input.orderId,
    nextStatus: "cancelled",
    action: "cancel",
    actor: input.actor,
    reason: input.reason ?? null,
    note,
  });
}
