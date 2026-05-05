import {
  ORDER_SOURCES,
  ORDER_STATUSES,
  type OrderSource,
  type OrderStatus,
} from "../../../src/types/order";

export { ORDER_SOURCES, ORDER_STATUSES };
export type { OrderSource, OrderStatus };

export const TELEGRAM_BOT_ROLES = [
  "customer",
  "sales",
  "admin",
] as const;

export type TelegramBotRole = (typeof TELEGRAM_BOT_ROLES)[number];

export type TelegramSessionLanguage = "kh" | "en";

export const TELEGRAM_SESSION_STEPS = [
  "awaiting_language",
  "idle",
  "home",
  "product_preview",
  "cart_preview",
  "awaiting_search",
  "awaiting_pasted_link",
  "awaiting_order_code",
  "awaiting_fulfillment",
  "awaiting_quantity",
  "awaiting_phone",
  "awaiting_name",
  "awaiting_note",
  "review",
  "sales_home",
  "sales_order_context",
  "sales_awaiting_order_lookup",
  "sales_awaiting_order_text",
  "sales_awaiting_product_question",
  "sales_awaiting_stock_question",
  "sales_awaiting_fulfillment_change",
  "sales_awaiting_note",
  "admin_home",
  "admin_review",
  "admin_awaiting_search",
  "admin_awaiting_reason",
  "admin_awaiting_note",
  "completed",
  "cancelled",
] as const;

export type TelegramSessionStep = (typeof TELEGRAM_SESSION_STEPS)[number];

export const TELEGRAM_DEEPLINK_TYPES = [
  "product",
  "cart",
  "reference",
  "link",
  "order",
] as const;

export type TelegramDeeplinkType = (typeof TELEGRAM_DEEPLINK_TYPES)[number];

export interface TelegramSelectedItem {
  productId: string;
  qty: number;
}

export interface TelegramPurchaseSessionState {
  source: OrderSource;
  items: TelegramSelectedItem[];
  language?: TelegramSessionLanguage | null;
  orderCode?: string | null;
  shortOrderId?: string | null;
  currentProductId?: string | null;
  fulfillmentMethod?: "pickup" | "delivery" | null;
  customerName?: string | null;
  customerPhone?: string | null;
  note?: string | null;
  deeplinkReferenceId?: string | null;
  draftOrderId?: string | null;
  lastResolvedLink?: string | null;
}

export const TELEGRAM_SALES_PENDING_ACTIONS = [
  "confirm_details",
  "ask_stock",
  "change_fulfillment",
  "add_note",
  "ask_product",
] as const;

export type TelegramSalesPendingAction =
  (typeof TELEGRAM_SALES_PENDING_ACTIONS)[number];

export interface TelegramSalesSessionState {
  source: OrderSource;
  language?: TelegramSessionLanguage | null;
  selectedOrderId?: string | null;
  selectedOrderCode?: string | null;
  selectedShortOrderId?: string | null;
  pendingAction?: TelegramSalesPendingAction | null;
  lastFreeformMessage?: string | null;
}

export const TELEGRAM_ADMIN_PENDING_ACTIONS = [
  "reject",
  "clarify",
  "note",
] as const;

export type TelegramAdminPendingAction =
  (typeof TELEGRAM_ADMIN_PENDING_ACTIONS)[number];

export interface TelegramAdminSessionState {
  source: OrderSource;
  selectedOrderId?: string | null;
  pendingAction?: TelegramAdminPendingAction | null;
  targetChatId?: string | null;
}

export interface TelegramProductPayload {
  version: 1;
  type: "product";
  productId: string;
  qty?: number;
}

export interface TelegramCartPayload {
  version: 1;
  type: "cart";
  referenceId: string;
}

export interface TelegramReferencePayload {
  version: 1;
  type: "reference";
  referenceId: string;
}

export interface TelegramLinkPayload {
  version: 1;
  type: "link";
  lookupKey: string;
}

export interface TelegramOrderPayload {
  version: 1;
  type: "order";
  shortOrderId: string;
}

export type TelegramStartPayload =
  | TelegramProductPayload
  | TelegramCartPayload
  | TelegramReferencePayload
  | TelegramLinkPayload
  | TelegramOrderPayload;

export interface TelegramCategoryOption {
  id: string;
  label: string;
  count: number;
}
