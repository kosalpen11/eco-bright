import type { OrderRecord } from "../../../../src/types/order";

export interface AdminOrderActor {
  telegramUserId: string;
  displayName?: string | null;
  username?: string | null;
}

export interface AdminOrderActionInput {
  orderId: string;
  actor: AdminOrderActor;
  reason?: string | null;
  note?: string | null;
}

export interface AdminOrderActionResult {
  order: OrderRecord;
  previousStatus: OrderRecord["status"];
}
