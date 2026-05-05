import type { CurrencyCode, Invoice } from "@/types/invoice";

export const ORDER_STATUSES = [
  "draft",
  "pending",
  "accepted",
  "rejected",
  "needs_clarification",
  "processing",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_ACTOR_TYPES = [
  "admin",
  "system",
  "customer",
  "sales",
] as const;

export type OrderStatusActorType = (typeof ORDER_STATUS_ACTOR_TYPES)[number];

export const ORDER_SOURCES = [
  "web",
  "telegram-bot",
  "telegram-deeplink",
  "pasted-link",
  "quick-order",
  "telegram-handoff",
] as const;

export type OrderSource = (typeof ORDER_SOURCES)[number];
export type FulfillmentMethod = "pickup" | "delivery";

export interface CreateOrderInput {
  invoice: Invoice;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  fulfillmentMethod?: FulfillmentMethod;
  source?: OrderSource;
}

export interface OrderRecord {
  id: string;
  invoiceId: string;
  shortOrderId: string | null;
  orderCode: string | null;
  shop: string;
  currency: CurrencyCode;
  itemCount: number;
  subtotal: number;
  total: number;
  customerName: string | null;
  customerPhone: string | null;
  note: string | null;
  fulfillmentMethod: FulfillmentMethod | null;
  telegramUserId: string | null;
  telegramUsername: string | null;
  telegramUrl: string | null;
  telegramMessage: string | null;
  telegramCustomerUserId: string | null;
  telegramCustomerUsername: string | null;
  telegramCustomerChatId: string | null;
  status: OrderStatus;
  source: OrderSource;
  adminNote: string | null;
  rejectionReason: string | null;
  acceptedAt: Date | null;
  rejectedAt: Date | null;
  processedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  reviewedByTelegramUserId: string | null;
  reviewedByName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId: string;
  title: string;
  price: number;
  qty: number;
  lineTotal: number;
  imageUrl: string | null;
  category: string | null;
  createdAt: Date;
}

export interface OrderStatusHistoryRecord {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  action: string;
  reason: string | null;
  actorType: OrderStatusActorType;
  actorId: string | null;
  actorName: string | null;
  createdAt: Date;
}

export interface OrderWithItemsRecord {
  order: OrderRecord;
  items: OrderItemRecord[];
}

export interface TelegramOrderPayload {
  orderId?: string;
  shortOrderId?: string;
  orderCode?: string;
  invoiceId: string;
  shop: string;
  currency: CurrencyCode;
  items: Array<{
    productId: string;
    title: string;
    price: number;
    qty: number;
    lineTotal: number;
    imageUrl?: string | null;
    category?: string | null;
  }>;
  subtotal: number;
  total: number;
  customerName?: string | null;
  customerPhone?: string | null;
  note?: string | null;
  fulfillmentMethod?: FulfillmentMethod | null;
}

export interface PersistedOrderSummary {
  orderId: string;
  shortOrderId: string;
  orderCode?: string | null;
  invoiceId: string;
  status: OrderStatus;
  telegramUrl: string;
  telegramMessage: string;
  modificationDeeplink?: string | null;
  salesDeeplink?: string | null;
  fulfillmentMethod?: FulfillmentMethod | null;
  source: OrderSource;
  alreadyExists?: boolean;
}
