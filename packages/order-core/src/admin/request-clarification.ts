import { applyAdminOrderAction, buildAdminAuditNote } from "./_shared";
import type { AdminOrderActionInput } from "./types";

export async function requestClarification(input: AdminOrderActionInput) {
  const reason = input.reason?.trim();

  if (!reason) {
    throw new Error("A clarification request is required.");
  }

  const note = buildAdminAuditNote({
    actor: input.actor,
    text: `Requested clarification. ${reason}`,
  });

  return applyAdminOrderAction({
    orderId: input.orderId,
    nextStatus: "needs_clarification",
    action: "request_clarification",
    actor: input.actor,
    reason,
    note,
  });
}
