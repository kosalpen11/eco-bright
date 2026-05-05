import { InlineKeyboard } from "grammy";

export function buildSalesOrderKeyboard() {
  return new InlineKeyboard()
    .text("✅ Confirm Details", "sales:confirm-details")
    .text("📦 Ask About Stock", "sales:ask-stock")
    .row()
    .text("🚚 Change Delivery / Pickup", "sales:change-fulfillment")
    .text("📝 Add Note", "sales:add-note")
    .row()
    .text("👤 Contact Human Sales", "sales:human")
    .text("❌ Cancel", "sales:cancel");
}

export function buildSalesFallbackKeyboard() {
  return new InlineKeyboard()
    .text("🔗 Paste Order ID", "sales:paste-order-id")
    .text("📋 Paste Order Text", "sales:paste-order-text")
    .row()
    .text("💬 Ask About Product", "sales:ask-product")
    .text("👤 Contact Human Sales", "sales:human");
}

export function buildSalesBackKeyboard() {
  return new InlineKeyboard().text("Back", "sales:back");
}
