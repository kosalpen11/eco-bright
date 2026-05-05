import type {
  TelegramConfig,
  TelegramHandoffMode,
} from "@/lib/telegram-order/types";

const DEFAULT_TELEGRAM_TARGET = "https://t.me/eco_bright_sale_bot";

function sanitizeTelegramTarget(value: string) {
  return value.trim();
}

function formatPhoneTarget(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");

  if (digits.startsWith("855") && digits.length === 11) {
    return `+855 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }

  return phone;
}

export function extractTelegramPhone(telegramTarget: string): string | null {
  const normalized = sanitizeTelegramTarget(telegramTarget);

  if (!normalized) {
    return null;
  }

  const candidate = normalized
    .replace(/^https?:\/\/t\.me\//, "")
    .replace(/^tg:\/\/resolve\?phone=/, "")
    .replace(/[^\d+]/g, "");

  return /^\+\d{6,20}$/.test(candidate) ? candidate : null;
}

export function extractTelegramUsername(telegramTarget: string): string | null {
  const normalized = sanitizeTelegramTarget(telegramTarget);

  if (!normalized || extractTelegramPhone(normalized)) {
    return null;
  }

  if (normalized.startsWith("@")) {
    return normalized.slice(1);
  }

  if (/^[a-zA-Z0-9_]{4,}$/.test(normalized)) {
    return normalized;
  }

  try {
    const url = new URL(
      normalized.startsWith("http://") || normalized.startsWith("https://")
        ? normalized
        : `https://${normalized}`,
    );
    const username = url.pathname.split("/").filter(Boolean)[0]?.replace(/^@/, "");
    return username || null;
  } catch {
    return normalized.replace(/^https?:\/\/t\.me\//, "").replace(/^@/, "") || null;
  }
}

export function getTelegramTargetLabel(telegramTarget: string) {
  const phone = extractTelegramPhone(telegramTarget);

  if (phone) {
    return formatPhoneTarget(phone);
  }

  const username = extractTelegramUsername(telegramTarget);
  return username ? `@${username}` : telegramTarget;
}

export function normalizeTelegramTarget(target?: string | null) {
  const normalized = target?.trim();
  return normalized || DEFAULT_TELEGRAM_TARGET;
}

export function normalizeTelegramBotUsername(botUsername?: string | null) {
  const normalized = botUsername?.trim().replace(/^@/, "");
  return normalized || null;
}

export function validateTelegramConfig(input?: {
  target?: string | null;
  fallbackTarget?: string | null;
  botUsername?: string | null;
  preferredMode?: TelegramHandoffMode;
}): TelegramConfig {
  const target = normalizeTelegramTarget(input?.target || input?.fallbackTarget);
  const username = extractTelegramUsername(target);
  const phone = extractTelegramPhone(target);
  const botUsername = normalizeTelegramBotUsername(input?.botUsername);
  const preferredMode =
    input?.preferredMode ?? (botUsername ? "bot-start" : "direct-chat");

  return {
    target,
    targetLabel: getTelegramTargetLabel(target),
    username,
    phone,
    botUsername,
    preferredMode,
  };
}

export function getTelegramOrderTarget(fallbackTarget?: string) {
  return validateTelegramConfig({
    target:
      process.env.TELEGRAM_ORDER_TARGET?.trim() ||
      process.env.NEXT_PUBLIC_TELEGRAM_URL?.trim() ||
      process.env.NEXT_PUBLIC_ORDER_TELEGRAM_URL?.trim() ||
      fallbackTarget?.trim(),
  }).target;
}

export function getTelegramBotUsername() {
  return normalizeTelegramBotUsername(process.env.TELEGRAM_BOT_USERNAME);
}
