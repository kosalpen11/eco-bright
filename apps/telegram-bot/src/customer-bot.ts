import {
  getTelegramBotRuntimeConfig,
  loadWorkspaceEnv,
} from "../../../packages/config/src";
import { registerCustomerHandlers } from "./handlers/customer";
import { createTelegramBotRuntime } from "./runtime/start-bot";
import { SalesSupportQueryService } from "./services/sales-support-query-service";
import { TelegramSessionService } from "./services/telegram-session-service";

loadWorkspaceEnv();

const config = getTelegramBotRuntimeConfig();
const bot = createTelegramBotRuntime(config.TELEGRAM_BOT_TOKEN, "customer");
const sessionService = new TelegramSessionService("customer");
const salesSupportService = new SalesSupportQueryService();

registerCustomerHandlers(bot, sessionService, salesSupportService);

bot.start().then(() => {
  console.log("Customer Telegram bot started", {
    botUsername: config.TELEGRAM_BOT_USERNAME,
    salesBotUsername: config.TELEGRAM_ORDER_TARGET,
    supportTarget: config.TELEGRAM_SUPPORT_TARGET ?? config.TELEGRAM_ORDER_TARGET,
  });
});
