import type { Bot } from "grammy";
import { registerCategoryHandlers } from "./category";
import { registerOrderHandlers } from "./order";
import { registerProductHandlers } from "./product";
import { registerStartHandler } from "./start";
import { registerSupportHandlers } from "./support";
import { SalesSupportQueryService } from "../services/sales-support-query-service";
import { TelegramSessionService } from "../services/telegram-session-service";

export function registerCustomerHandlers(
  bot: Bot,
  sessionService: TelegramSessionService,
  salesSupportService: SalesSupportQueryService,
) {
  registerStartHandler(bot, sessionService);
  registerCategoryHandlers(bot);
  registerProductHandlers(bot, sessionService);
  registerOrderHandlers(bot, sessionService);
  registerSupportHandlers(bot, sessionService, salesSupportService);
}
