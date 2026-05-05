import type { TelegramSessionLanguage } from "../../../../packages/shared/src";
import { getLatestResumableOrderForTelegramUser } from "../../../../src/db/queries/orders";
import { restoreOrderFlowFromLookup, restoreOrderFlowFromOrderId } from "../flows/order-modification-flow";
import { TelegramSessionService } from "./telegram-session-service";

export class CustomerOrderService {
  constructor(
    readonly sessionService = new TelegramSessionService("customer"),
  ) {}

  async getSession(telegramUserId: string) {
    return this.sessionService.getState(telegramUserId);
  }

  async saveSession(...args: Parameters<TelegramSessionService["save"]>) {
    return this.sessionService.save(...args);
  }

  async resetSession(telegramUserId: string) {
    return this.sessionService.reset(telegramUserId);
  }

  async getLatestResumableOrder(telegramUserId: string) {
    return getLatestResumableOrderForTelegramUser(telegramUserId);
  }

  async restoreOrderByLookup(input: {
    lookup: string;
    telegramUserId?: string;
    telegramUsername?: string | null;
    lang?: TelegramSessionLanguage;
  }) {
    return restoreOrderFlowFromLookup(input);
  }

  async restoreOrderById(input: {
    orderId: string;
    telegramUserId?: string;
    telegramUsername?: string | null;
    lang?: TelegramSessionLanguage;
  }) {
    return restoreOrderFlowFromOrderId(input);
  }
}
