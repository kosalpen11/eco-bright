import { applyAdminOrderAction, buildAdminAuditNote } from "./_shared";
import type { AdminOrderActionInput } from "./types";

export async function completeOrder(input: AdminOrderActionInput) {
  const note = buildAdminAuditNote({
    actor: input.actor,
    text: input.note ? `Completed order. ${input.note}` : "Completed order.",
  });

  return applyAdminOrderAction({
    orderId: input.orderId,
    nextStatus: "completed",
    action: "complete",
    actor: input.actor,
    note,
  });
}
