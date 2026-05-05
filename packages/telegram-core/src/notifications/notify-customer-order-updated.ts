import type { OrderStatus } from "../../../../src/types/order";
import { buildCustomerStatusMessage } from "./build-customer-status-message";

export async function notifyCustomerOrderUpdated(input: {
  botToken: string;
  chatId?: string | null;
  invoiceId: string;
  status: OrderStatus;
  shop: string;
  customText?: string | null;
}) {
  if (!input.chatId) {
    return {
      ok: false,
      skipped: true,
      reason: "No customer chat id available for notification.",
    };
  }

  const response = await fetch(
    `https://api.telegram.org/bot${input.botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        chat_id: input.chatId,
        text: buildCustomerStatusMessage({
          order: {
            invoiceId: input.invoiceId,
            status: input.status,
            shop: input.shop,
          },
          customText: input.customText,
        }),
      }),
    },
  );

  const data = (await response.json()) as { ok: boolean; description?: string };

  if (!response.ok || !data.ok) {
    throw new Error(data.description ?? "Failed to notify customer.");
  }

  return {
    ok: true,
    skipped: false,
  };
}
