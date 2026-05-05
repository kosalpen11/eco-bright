import { InlineKeyboard } from "grammy";

export function buildTelegramTargetUrl(target: string) {
  const normalized = target.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("https://") || normalized.startsWith("http://")) {
    return normalized;
  }

  if (normalized.startsWith("@")) {
    return `https://t.me/${normalized.slice(1)}`;
  }

  return `https://t.me/${normalized}`;
}

export function buildLanguageKeyboard() {
  return new InlineKeyboard()
    .text("🇰🇭 ខ្មែរ", "lang:kh")
    .text("🇺🇸 English", "lang:en");
}

export function buildHomeKeyboard() {
  return new InlineKeyboard()
    .text("Shop Products", "menu:shop")
    .row()
    .text("Browse Categories", "browse:categories")
    .text("Search Product", "menu:search")
    .row()
    .text("Paste Product Link", "menu:paste-link")
    .text("My Cart", "cart:view")
    .row()
    .text("My Orders", "orders:list")
    .text("Contact Support", "support");
}

export function buildCancelKeyboard() {
  return new InlineKeyboard().text("Cancel", "order:cancel");
}

export function buildResumeKeyboard() {
  return new InlineKeyboard()
    .text("Resume Order", "resume:order")
    .text("Start New Order", "menu:new-order")
    .row()
    .text("Paste Short Order ID", "startup:paste-order-code");
}

/** Minimal fallback — no big shop menu, just 3 clear options */
export function buildStartupFallbackKeyboard() {
  return new InlineKeyboard()
    .text("🛍 Start Order", "menu:new-order")
    .row()
    .text("🔗 Paste Order ID", "startup:paste-order-code")
    .row()
    .text("💬 Contact Support", "support");
}

export function buildSupportKeyboard(target?: string | null) {
  const keyboard = new InlineKeyboard();
  const supportUrl = target ? buildTelegramTargetUrl(target) : null;

  if (supportUrl) {
    keyboard.url("Open sales chat", supportUrl).row();
  }

  return keyboard.text("Main Menu", "menu:home");
}

export function buildMainMenuOnlyKeyboard() {
  return new InlineKeyboard().text("Main Menu", "menu:home");
}
