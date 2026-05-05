import {
  applyOrderStatusUpdate,
  getOrderById,
} from "../../../../src/db/queries/orders";
import type { OrderStatus } from "../../../../src/types/order";
import { assertOrderStatusTransition } from "../order-status-machine";
import type {
  AdminOrderActionResult,
  AdminOrderActor,
} from "./types";

function formatActorLabel(actor: AdminOrderActor) {
  if (actor.displayName) {
    return actor.displayName;
  }

  if (actor.username) {
    return `@${actor.username}`;
  }

  return actor.telegramUserId;
}

function appendAdminNote(existingNote: string | null, nextNote?: string | null) {
  const trimmed = nextNote?.trim();

  if (!trimmed) {
    return existingNote;
  }

  const prefix = existingNote ? `${existingNote}\n\n` : "";
  return `${prefix}${trimmed}`;
}

export function buildAdminAuditNote(input: {
  actor: AdminOrderActor;
  text: string;
}) {
  return `[${new Date().toISOString()}] ${formatActorLabel(input.actor)}: ${input.text.trim()}`;
}

export async function applyAdminOrderAction(input: {
  orderId: string;
  nextStatus: OrderStatus;
  action: string;
  actor: AdminOrderActor;
  reason?: string | null;
  note?: string | null;
  rejectionReason?: string | null;
}): Promise<AdminOrderActionResult> {
  const existingOrder = await getOrderById(input.orderId);

  if (!existingOrder) {
    throw new Error(`Order not found: ${input.orderId}`);
  }

  assertOrderStatusTransition(existingOrder.status, input.nextStatus);

  const nextAdminNote = appendAdminNote(existingOrder.adminNote, input.note);
  const updatedOrder = await applyOrderStatusUpdate({
    orderId: input.orderId,
    nextStatus: input.nextStatus,
    action: input.action,
    actorType: "admin",
    actorId: input.actor.telegramUserId,
    actorName: formatActorLabel(input.actor),
    reason: input.reason ?? null,
    adminNote: nextAdminNote,
    rejectionReason: input.rejectionReason ?? null,
  });

  if (!updatedOrder) {
    throw new Error(`Failed to update order: ${input.orderId}`);
  }

  return {
    order: updatedOrder,
    previousStatus: existingOrder.status,
  };
}
