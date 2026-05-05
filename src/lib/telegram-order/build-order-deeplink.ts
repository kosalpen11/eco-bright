import { extractTelegramUsername } from "@/lib/telegram-order/validate-telegram-config";

/**
 * Build order modification deeplink
 * Format: v1.o.{shortOrderId}
 * 
 * This deeplink allows customers to:
 * - Resume an incomplete order
 * - Modify order contents (qty, fulfillment)
 * - Reconfirm and submit
 */
export function buildOrderDeeplink(shortOrderId: string): string {
  if (!shortOrderId || shortOrderId.length === 0) {
    throw new Error("shortOrderId is required");
  }

  // Format: v1.o.{shortOrderId}
  const encoded = encodeURIComponent(shortOrderId);
  return `v1.o.${encoded}`;
}

/**
 * Build order modification Telegram bot URL
 * Example: https://t.me/eco_bright_bot?start=v1.o.ECO-2026-0001
 */
export function buildOrderModificationBotUrl(botUsername: string, shortOrderId: string): string {
  const normalizedBot = botUsername.trim().replace(/^@/, "");

  if (!normalizedBot) {
    throw new Error("Telegram bot username is required");
  }

  if (!shortOrderId) {
    throw new Error("shortOrderId is required");
  }

  const payload = buildOrderDeeplink(shortOrderId);
  return `https://t.me/${normalizedBot}?start=${encodeURIComponent(payload)}`;
}

export function buildOrderBotUrlForTarget(
  telegramTarget: string,
  shortOrderId: string,
): string | null {
  const username = extractTelegramUsername(telegramTarget);

  if (!username) {
    return null;
  }

  return buildOrderModificationBotUrl(username, shortOrderId);
}
