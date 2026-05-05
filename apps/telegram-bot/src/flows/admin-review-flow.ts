import type { AdminOrderActor } from "../../../../packages/order-core/src";
import type { AdminOrderService } from "../services/admin-order-service";

export async function loadAdminReviewQueue(
  service: AdminOrderService,
  limit?: number,
) {
  return service.listIncomingOrders(limit);
}

export async function loadAdminOrderReview(
  service: AdminOrderService,
  orderId: string,
) {
  return service.getOrderReview(orderId);
}

export async function applyAdminReviewAction(
  service: AdminOrderService,
  input: {
    action: "accept" | "reject" | "processing" | "complete" | "cancel" | "refresh";
    orderId: string;
    actor: AdminOrderActor;
  },
) {
  return service.applyImmediateAction(input);
}
