import {
  getTelegramSalesBotRuntimeConfig,
  loadWorkspaceEnv,
} from "../../../packages/config/src";
import { registerSalesHandlers } from "./handlers/sales";
import { createTelegramBotRuntime } from "./runtime/start-bot";
import { SalesOrderService } from "./services/sales-order-service";

loadWorkspaceEnv();

const config = getTelegramSalesBotRuntimeConfig();

if (!config.enabled || !config.botToken) {
  throw new Error(
    "TELEGRAM_SALES_BOT_TOKEN is required to start the sales bot runtime.",
  );
}

const bot = createTelegramBotRuntime(config.botToken, "sales");
const salesOrderService = new SalesOrderService();

registerSalesHandlers(bot, salesOrderService);

bot.start().then(() => {
  console.log("Sales Telegram bot started", {
    botUsername: config.botUsername,
  });
});
