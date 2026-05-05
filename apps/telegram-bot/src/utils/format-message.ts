import { buildOrderSummaryMessage, buildProductMessage, buildSupportMessage } from "../../../../packages/telegram-core/src";

export const formatBotProductMessage = buildProductMessage;
export const formatBotOrderSummaryMessage = buildOrderSummaryMessage;
export const formatSupportMessage = buildSupportMessage;

export type BotLang = "kh" | "en";

const t = {
  welcome: {
    en: (shopName: string, salesTarget: string) =>
      `Welcome to ${shopName}.\nChoose how you want to continue.\n\nYou can also paste a product link here any time, or contact sales at @${salesTarget.replace(/^@/, "")}.`,
    kh: (shopName: string, _salesTarget: string) =>
      `សូមស្វាគមន៍មកកាន់ ${shopName}។\nជ្រើសរើសសកម្មភាពដែលអ្នកចង់ធ្វើ។\n\nអ្នកអាចបិទភ្ជាប់តំណទំនិញបានគ្រប់ពេល ឬទាក់ទងផ្នែកលក់តាម Telegram។`,
  },
  languagePrompt: {
    en: (shopName: string) =>
      `Welcome to ${shopName}.\nPlease choose your language.\n\nសូមជ្រើសរើសភាសា`,
    kh: (shopName: string) =>
      `សូមស្វាគមន៍មកកាន់ ${shopName}។\nសូមជ្រើសរើសភាសា.\n\nWelcome. Please choose your language.`,
  },
  resume: {
    en: () => "I found an order you can continue.\nResume it now, start a new order, or paste a short order ID.",
    kh: () => "ខ្ញុំបានរកឃើញការបញ្ជាទិញដែលអ្នកអាចបន្ត។\nបន្តការបញ្ជាទិញ ចាប់ផ្ដើមការបញ្ជាទិញថ្មី ឬបិទភ្ជាប់លេខសម្គាល់ការបញ្ជាទិញ។",
  },
  fallback: {
    en: (shopName: string) => `Welcome to ${shopName}.\nStart a new order, paste a short order ID, or contact sales.`,
    kh: (shopName: string) => `សូមស្វាគមន៍មកកាន់ ${shopName}។\nចាប់ផ្ដើមការបញ្ជាទិញថ្មី បិទភ្ជាប់លេខសម្គាល់ ឬទាក់ទងផ្នែកលក់។`,
  },
  pasteOrderCodePrompt: {
    en: () => "Paste your short order ID.\nExample: ECO-8K4P2\nLegacy IDs like ECO-2026-0001 also work.",
    kh: () => "បិទភ្ជាប់លេខសម្គាល់ការបញ្ជាទិញខ្លីរបស់អ្នក។\nឧទាហរណ៍: ECO-8K4P2\nលេខចាស់ដូចជា ECO-2026-0001 ក៏ដំណើរការដែរ។",
  },
  search: {
    en: () => "Search products by title, keyword, or product code.\nExample: flood light, bulb, solar panel, prd_001",
    kh: () => "ស្វែងរកទំនិញតាមឈ្មោះ ពាក្យគន្លឹះ ឬលេខកូដផលិតផល។\nឧទាហរណ៍: ភ្លើងហ្វ្លដ៍, អំពូល, បន្ទះសូឡា",
  },
  pasteLink: {
    en: () => "Paste a product link from the website.\nI will try to restore the product and start checkout.",
    kh: () => "បិទភ្ជាប់តំណផលិតផលពីគេហទំព័រ។\nខ្ញុំនឹងព្យាយាមស្ដារផលិតផល ហើយចាប់ផ្ដើមការបញ្ជាទិញ។",
  },
  orderCreated: {
    en: () => "Your order has been received. Our team will continue with you shortly.",
    kh: () => "ការបញ្ជាទិញរបស់អ្នកត្រូវបានទទួល។ ក្រុមការងាររបស់យើងនឹងបន្តជាមួយអ្នកក្នុងពេលឆាប់ៗ។",
  },
} as const;

export function formatLanguagePromptMessage(shopName: string): string {
  // Always bilingual — user hasn't chosen language yet
  return t.languagePrompt.en(shopName);
}

export function formatWelcomeMessage(input: { shopName: string; salesTarget: string }, lang: BotLang = "en") {
  return t.welcome[lang](input.shopName, input.salesTarget);
}

export function formatResumeMessage(lang: BotLang = "en") {
  return t.resume[lang]();
}

export function formatStartupFallbackMessage(shopName: string, lang: BotLang = "en") {
  return t.fallback[lang](shopName);
}

export function formatPasteOrderCodePrompt(lang: BotLang = "en") {
  return t.pasteOrderCodePrompt[lang]();
}

export function formatSearchPrompt(lang: BotLang = "en") {
  return t.search[lang]();
}

export function formatPasteLinkPrompt(lang: BotLang = "en") {
  return t.pasteLink[lang]();
}

export function formatOrderCreatedMessage(lang: BotLang = "en") {
  return t.orderCreated[lang]();
}

export function formatCartMessage(input: {
  shopName: string;
  currency: string;
  items: Array<{
    title: string;
    qty: number;
    price: number;
    lineTotal: number;
  }>;
  total: number;
}, lang: BotLang = "en") {
  if (!input.items.length) {
    return lang === "kh"
      ? "កន្ត្រករបស់អ្នកទទេ។\nបន្ថែមទំនិញជាមុន ហើយត្រឡប់មកបញ្ជាទិញ។"
      : "Your cart is empty.\nAdd products first, then come back to checkout.";
  }

  const header = lang === "kh" ? "កន្ត្រករបស់អ្នករួចរាល់ហើយ។\nពិនិត្យទំនិញខាងក្រោម។" : "Your cart is ready.\nReview items below.";

  return [
    header,
    "",
    ...input.items.flatMap((item) => [
      `• ${item.title}`,
      `  ${item.qty} × ${item.price.toFixed(2)} ${input.currency}`,
      `  ${lang === "kh" ? "សរុប" : "Line total"}: ${item.lineTotal.toFixed(2)} ${input.currency}`,
    ]),
    "",
    `${lang === "kh" ? "សរុបទាំងអស់" : "Total"}: ${input.total.toFixed(2)} ${input.currency}`,
  ].join("\n");
}

export function formatOrdersListMessage(input: {
  shopName: string;
  orders: Array<{
    shortOrderId?: string | null;
    invoiceId: string;
    status: string;
    total: number;
    currency: string;
  }>;
}, lang: BotLang = "en") {
  if (!input.orders.length) {
    return lang === "kh"
      ? `រកមិនឃើញការបញ្ជាទិញសម្រាប់ ${input.shopName} នៅឡើយ។ ចាប់ផ្ដើមការបញ្ជាទិញថ្មី។`
      : `No orders found for ${input.shopName} yet. Start a new order from the main menu.`;
  }

  const header = lang === "kh" ? "ការបញ្ជាទិញថ្មីៗរបស់អ្នក:" : "Your recent orders:";

  return [
    header,
    "",
    ...input.orders.map(
      (order) =>
        `• ${order.shortOrderId ?? order.invoiceId}\n  Invoice: ${order.invoiceId}\n  Status: ${order.status.replace(/_/g, " ")}\n  Total: ${order.total.toFixed(2)} ${order.currency}`,
    ),
  ].join("\n");
}
