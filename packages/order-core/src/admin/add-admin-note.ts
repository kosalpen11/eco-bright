import { getOrderById } from "../../../../src/db/queries/orders";
import { applyAdminOrderAction, buildAdminAuditNote } from "./_shared";
import type { AdminOrderActionInput } from "./types";

export async function addAdminNote(input: AdminOrderActionInput) {
  const note = input.note?.trim();

  if (!note) {
    throw new Error("An admin note is required.");
  }

  const existingOrder = await getOrderById(input.orderId);

  if (!existingOrder) {
    throw new Error(`Order not found: ${input.orderId}`);
  }

  return applyAdminOrderAction({
    orderId: input.orderId,
    nextStatus: existingOrder.status,
    action: "add_note",
    actor: input.actor,
    note: buildAdminAuditNote({
      actor: input.actor,
      text: note,
    }),
  });
}
