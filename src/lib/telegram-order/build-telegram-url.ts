import {
  extractTelegramPhone,
  extractTelegramUsername,
} from "@/lib/telegram-order/validate-telegram-config";

function normalizeTelegramMessage(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

export function buildTelegramUrl(telegramTarget: string, message: string) {
  const normalized = telegramTarget.trim();
  const encodedMessage = encodeURIComponent(normalizeTelegramMessage(message));
  const phone = extractTelegramPhone(normalized);

  if (phone) {
    return `https://t.me/${phone}?text=${encodedMessage}`;
  }

  const username = extractTelegramUsername(normalized);

  if (!username) {
    return normalized;
  }

  return `https://t.me/${username}?text=${encodedMessage}`;
}
