import { InlineKeyboard } from "grammy";
import { buildTelegramTargetUrl } from "./common-keyboard";

export function buildLanguageKeyboard() {
  return new InlineKeyboard()
    .text("🇰🇭 ខ្មែរ", "lang:kh")
    .text("🇺🇸 English", "lang:en");
}

export function buildReviewKeyboard() {
  return new InlineKeyboard()
    .text("Confirm Order", "order:confirm")
    .text("Edit", "cart:view")
    .row()
    .text("Add Note", "order:add-note")
    .text("Cancel", "order:cancel");
}

export function buildSkipKeyboard(step: "name" | "note") {
  return new InlineKeyboard().text(
    step === "name" ? "Skip name" : "Skip note",
    `order:skip:${step}`,
  );
}

export function buildCartKeyboard() {
  return new InlineKeyboard()
    .text("Checkout", "cart:checkout")
    .text("Edit Cart", "browse:categories")
    .row()
    .text("Clear Cart", "cart:clear")
    .text("Main Menu", "menu:home");
}

export function buildOrderSuccessKeyboard() {
  return new InlineKeyboard()
    .text("Contact Sales", "support")
    .text("Copy Summary", "order:summary")
    .row()
    .text("My Orders", "orders:list")
    .text("Main Menu", "menu:home");
}

/** Used when order is restored and is modifiable (draft / any non-pending continuable status) */
export function buildOrderContinuationKeyboard() {
  return new InlineKeyboard()
    .text("✅ Confirm Order", "order:confirm")
    .text("💬 Contact Sales", "support")
    .row()
    .text("❌ Cancel Order", "order:cancel");
}

/** Used specifically when order status === "pending" — Sales is the PRIMARY action */
export function buildPendingOrderKeyboard(supportTarget?: string | null) {
  const keyboard = new InlineKeyboard();
  const supportUrl = supportTarget ? buildTelegramTargetUrl(supportTarget) : null;

  if (supportUrl) {
    keyboard.url("💬 Contact Sales", supportUrl).row();
  } else {
    keyboard.text("💬 Contact Sales", "support").row();
  }

  return keyboard
    .text("✅ Confirm Again", "order:confirm")
    .text("❌ Cancel", "order:cancel");
}

export function buildOrderReceivedKeyboard(target?: string | null) {
  const keyboard = new InlineKeyboard();
  const supportUrl = target ? buildTelegramTargetUrl(target) : null;

  if (supportUrl) {
    keyboard.url("Open Sales Chat", supportUrl).row();
  }

  return keyboard.text("Check Status", "orders:list").text("Done", "menu:home");
}

export function buildCheckoutKeyboard() {
  return new InlineKeyboard()
    .text("Pickup", "order:fulfillment:pickup")
    .text("Delivery", "order:fulfillment:delivery")
    .row()
    .text("Main Menu", "menu:home");
}
