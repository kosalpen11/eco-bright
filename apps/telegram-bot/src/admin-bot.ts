import {
  getTelegramAdminRuntimeConfig,
  loadWorkspaceEnv,
} from "../../../packages/config/src";
import { registerAdminHandlers } from "./handlers/admin";
import { createTelegramBotRuntime } from "./runtime/start-bot";
import { AdminOrderService } from "./services/admin-order-service";

loadWorkspaceEnv();

const config = getTelegramAdminRuntimeConfig();

if (!config.enabled || !config.botToken) {
  throw new Error(
    "TELEGRAM_ADMIN_BOT_TOKEN and ADMIN_TELEGRAM_USER_IDS are required to start the admin bot runtime.",
  );
}

const bot = createTelegramBotRuntime(config.botToken, "admin");
const adminOrderService = new AdminOrderService();

registerAdminHandlers(bot, adminOrderService);

bot.start().then(() => {
  console.log("Admin Telegram bot started", {
    botUsername: config.botUsername,
    adminUsers: config.adminUserIds.length,
    adminChatId: config.adminChatId,
  });
});
