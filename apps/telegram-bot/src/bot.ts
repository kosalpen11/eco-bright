import {
  getTelegramBotRuntimeConfig,
  getTelegramSalesBotRuntimeConfig,
  getTelegramAdminRuntimeConfig,
  loadWorkspaceEnv,
} from "../../../packages/config/src";

loadWorkspaceEnv();

const customerConfig = getTelegramBotRuntimeConfig();
const salesConfig = getTelegramSalesBotRuntimeConfig();
const adminConfig = getTelegramAdminRuntimeConfig();

console.log("--------------------------------------------------");
console.log("⚡ Starting ECO BRIGHT Telegram Bot Ecosystem...");
console.log("--------------------------------------------------");

// Customer Bot
if (customerConfig.TELEGRAM_BOT_TOKEN) {
  import("./customer-bot").catch((err) => {
    console.error("❌ Failed to start Customer Bot:", err);
  });
} else {
  console.log("⚠️ Customer Bot is disabled (TELEGRAM_BOT_TOKEN is missing).");
}

// Sales Bot
if (salesConfig.enabled && salesConfig.botToken) {
  import("./sales-bot").catch((err) => {
    console.error("❌ Failed to start Sales Bot:", err);
  });
} else {
  console.log("⚠️ Sales Bot is disabled (TELEGRAM_SALES_BOT_TOKEN is missing).");
}

// Admin Bot
if (adminConfig.enabled && adminConfig.botToken) {
  import("./admin-bot").catch((err) => {
    console.error("❌ Failed to start Admin Bot:", err);
  });
} else {
  console.log("⚠️ Admin Bot is disabled (TELEGRAM_ADMIN_BOT_TOKEN or ADMIN_TELEGRAM_USER_IDS missing).");
}
