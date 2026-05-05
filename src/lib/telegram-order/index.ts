export {
  buildTelegramOrderMessage,
} from "@/lib/telegram-order/build-order-message";
export {
  buildTelegramBotUrl,
  buildTelegramOrderHandoff,
} from "@/lib/telegram-order/build-bot-url";
export {
  buildTelegramStartPayload,
  canUseTelegramStartPayload,
} from "@/lib/telegram-order/build-start-payload";
export { buildTelegramUrl } from "@/lib/telegram-order/build-telegram-url";
export {
  extractTelegramPhone,
  extractTelegramUsername,
  getTelegramBotUsername,
  getTelegramOrderTarget,
  getTelegramTargetLabel,
  normalizeTelegramBotUsername,
  normalizeTelegramTarget,
  validateTelegramConfig,
} from "@/lib/telegram-order/validate-telegram-config";
export type {
  TelegramConfig,
  TelegramHandoffMode,
  TelegramOrderMessageInput,
  TelegramOrderResult,
  TelegramStartPayloadInput,
} from "@/lib/telegram-order/types";
