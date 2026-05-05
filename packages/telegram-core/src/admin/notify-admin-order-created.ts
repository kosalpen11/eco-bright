import { buildAdminOrderKeyboard } from "./build-admin-order-keyboard";
import { buildAdminOrderMessage } from "./build-admin-order-message";
import { sendAdminMessage } from "./send-admin-message";
import type { AdminOrderMessageInput } from "./types";

export async function notifyAdminOrderCreated(input: {
  botToken: string;
  chatId: string;
  order: AdminOrderMessageInput;
}) {
  return sendAdminMessage({
    botToken: input.botToken,
    chatId: input.chatId,
    text: buildAdminOrderMessage(input.order),
    keyboard: buildAdminOrderKeyboard({
      orderId: input.order.orderId,
      status: input.order.status,
    }),
  });
}
