import { applyAdminOrderAction, buildAdminAuditNote } from "./_shared";
import type { AdminOrderActionInput } from "./types";

export async function rejectOrder(input: AdminOrderActionInput) {
  const reason = input.reason?.trim();

  if (!reason) {
    throw new Error("A rejection reason is required.");
  }

  const note = buildAdminAuditNote({
    actor: input.actor,
    text: `Rejected order. ${reason}`,
  });

  return applyAdminOrderAction({
    orderId: input.orderId,
    nextStatus: "rejected",
    action: "reject",
    actor: input.actor,
    reason,
    note,
    rejectionReason: reason,
  });
}
