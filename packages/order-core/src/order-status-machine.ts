import type { OrderStatus } from "../../../src/types/order";

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ["pending", "cancelled"],
  pending: ["accepted", "rejected", "needs_clarification", "processing", "cancelled"],
  accepted: ["processing", "completed", "needs_clarification", "cancelled"],
  rejected: [],
  needs_clarification: ["pending", "accepted", "rejected", "cancelled"],
  processing: ["completed", "needs_clarification", "cancelled"],
  completed: [],
  cancelled: [],
};

export function getAvailableOrderStatusTransitions(currentStatus: OrderStatus) {
  return [...TRANSITIONS[currentStatus]];
}

export function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
) {
  return currentStatus === nextStatus || TRANSITIONS[currentStatus].includes(nextStatus);
}

export function assertOrderStatusTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
) {
  if (!canTransitionOrderStatus(currentStatus, nextStatus)) {
    throw new Error(
      `Invalid order status transition: ${currentStatus} -> ${nextStatus}`,
    );
  }
}
