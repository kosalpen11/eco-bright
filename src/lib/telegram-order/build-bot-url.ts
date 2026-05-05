import { buildTelegramOrderMessage } from "@/lib/telegram-order/build-order-message";
import { buildTelegramStartPayload, canUseTelegramStartPayload } from "@/lib/telegram-order/build-start-payload";
import { buildTelegramUrl } from "@/lib/telegram-order/build-telegram-url";
import type {
  TelegramConfig,
  TelegramOrderMessageInput,
  TelegramOrderResult,
} from "@/lib/telegram-order/types";

export function buildTelegramBotUrl(botUsername: string, startPayload?: string) {
  const normalizedBot = botUsername.trim().replace(/^@/, "");

  if (!normalizedBot) {
    throw new Error("Telegram bot username is required");
  }

  if (!startPayload) {
    return `https://t.me/${normalizedBot}`;
  }

  return `https://t.me/${normalizedBot}?start=${encodeURIComponent(startPayload)}`;
}

export function buildTelegramOrderHandoff(input: {
  config: TelegramConfig;
  order: TelegramOrderMessageInput;
  orderId?: string;
  source?: string;
}): TelegramOrderResult {
  const message = buildTelegramOrderMessage({
    ...input.order,
    ...(input.orderId ? { orderId: input.orderId } : {}),
  });

  if (input.config.botUsername && input.config.preferredMode === "bot-start") {
    const startPayload = buildTelegramStartPayload({
      invoiceId: input.order.invoiceId,
      orderId: input.orderId,
      source: input.source,
      total: input.order.total,
    });

    if (canUseTelegramStartPayload(startPayload)) {
      return {
        url: buildTelegramBotUrl(input.config.botUsername, startPayload),
        message,
        mode: "bot-start",
        targetLabel: input.config.targetLabel,
        startPayload,
      };
    }
  }

  return {
    url: buildTelegramUrl(input.config.target, message),
    message,
    mode: "direct-chat",
    targetLabel: input.config.targetLabel,
  };
}
