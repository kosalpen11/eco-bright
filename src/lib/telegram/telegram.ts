import type { Invoice } from "@/types/invoice";
import { createOrderPayload, createTelegramOrderPayload } from "@/lib/ordering/create-order-payload";
import {
  buildTelegramOrderMessage,
  buildTelegramUrl,
  extractTelegramPhone,
  extractTelegramUsername,
  getTelegramTargetLabel,
} from "@/lib/telegram-order";

export {
  buildTelegramOrderMessage as formatTelegramOrderMessage,
  buildTelegramUrl as buildTelegramChatUrl,
  extractTelegramPhone,
  extractTelegramUsername,
  getTelegramTargetLabel,
};

export function getTelegramShareUrl(invoice: Invoice) {
  return buildTelegramUrl(
    invoice.telegramUrl,
    buildTelegramOrderMessage(createTelegramOrderPayload(createOrderPayload({ invoice }))),
  );
}
