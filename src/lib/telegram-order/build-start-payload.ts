import type { TelegramStartPayloadInput } from "@/lib/telegram-order/types";

function compactToken(value: string, maxLength: number) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, maxLength);
}

export function buildTelegramStartPayload(input: TelegramStartPayloadInput) {
  const parts = [
    input.orderId ? `o:${compactToken(input.orderId, 16)}` : null,
    `i:${compactToken(input.invoiceId, 18)}`,
    input.source ? `s:${compactToken(input.source, 12)}` : null,
    typeof input.total === "number" ? `t:${Math.round(input.total * 100)}` : null,
  ].filter(Boolean);

  return parts.join("|");
}

export function canUseTelegramStartPayload(payload: string) {
  return payload.length > 0 && payload.length <= 64;
}
