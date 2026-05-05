import { applyAdminOrderAction, buildAdminAuditNote } from "./_shared";
import type { AdminOrderActionInput } from "./types";

export async function acceptOrder(input: AdminOrderActionInput) {
  const note = input.note
    ? buildAdminAuditNote({
        actor: input.actor,
        text: `Accepted order. ${input.note}`,
      })
    : buildAdminAuditNote({
        actor: input.actor,
        text: "Accepted order.",
      });

  return applyAdminOrderAction({
    orderId: input.orderId,
    nextStatus: "accepted",
    action: "accept",
    actor: input.actor,
    note,
  });
}
