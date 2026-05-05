export {
  buildTelegramUrl as buildTelegramChatUrl,
  extractTelegramPhone,
  extractTelegramUsername,
  buildTelegramOrderMessage as formatTelegramOrderMessage,
  getTelegramTargetLabel,
} from "@/lib/telegram-order";

export {
  buildTelegramBotUrl,
  buildTelegramOrderHandoff as buildTelegramHandoffUrl,
  buildTelegramStartPayload,
  canUseTelegramStartPayload,
} from "@/lib/telegram-order";
