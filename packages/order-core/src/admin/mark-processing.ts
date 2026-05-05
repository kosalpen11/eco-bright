import { applyAdminOrderAction, buildAdminAuditNote } from "./_shared";
import type { AdminOrderActionInput } from "./types";

export async function markProcessing(input: AdminOrderActionInput) {
  const note = buildAdminAuditNote({
    actor: input.actor,
    text: input.note ? `Moved order to processing. ${input.note}` : "Moved order to processing.",
  });

  return applyAdminOrderAction({
    orderId: input.orderId,
    nextStatus: "processing",
    action: "processing",
    actor: input.actor,
    note,
  });
}
