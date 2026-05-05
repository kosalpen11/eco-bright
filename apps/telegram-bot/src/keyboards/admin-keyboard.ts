import { InlineKeyboard } from "grammy";
import type { AdminKeyboardLayout } from "../../../../packages/telegram-core/src";
import { buildAdminInlineKeyboard } from "./admin-order-keyboard";

export function buildAdminMenuKeyboard() {
  return new InlineKeyboard()
    .text("🆕 New Orders", "admin:queue:new")
    .text("⏳ Pending", "admin:queue:pending")
    .row()
    .text("🔄 Processing", "admin:queue:processing")
    .text("✅ Completed", "admin:queue:completed")
    .row()
    .text("🔎 Search Order", "admin:search")
    .text("📊 Reports", "admin:reports");
}

export function buildAdminOrderActionsKeyboard(layout: AdminKeyboardLayout) {
  return buildAdminInlineKeyboard(layout);
}

export function buildAdminSearchCancelKeyboard() {
  return new InlineKeyboard().text("Cancel Search", "admin:cancel-search");
}
