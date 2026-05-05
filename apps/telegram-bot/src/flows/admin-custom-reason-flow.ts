import type { AdminOrderActor } from "../../../../packages/order-core/src";
import type { TelegramAdminPendingAction } from "../../../../packages/shared/src";
import type { AdminOrderService } from "../services/admin-order-service";

export async function startAdminCustomReasonFlow(
  service: AdminOrderService,
  input: {
    telegramUserId: string;
    username?: string | null;
    orderId: string;
    action: TelegramAdminPendingAction;
    targetChatId?: string | null;
  },
) {
  return service.beginPendingTextAction(input);
}

export async function finishAdminCustomReasonFlow(
  service: AdminOrderService,
  input: {
    telegramUserId: string;
    username?: string | null;
    text: string;
    actor: AdminOrderActor;
  },
) {
  return service.consumePendingTextAction(input);
}
