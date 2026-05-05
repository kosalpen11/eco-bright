import type { CurrencyCode } from "@/types/invoice";
import type { FulfillmentMethod, TelegramOrderPayload } from "@/types/order";

export const TELEGRAM_HANDOFF_MODES = [
  "direct-chat",
  "bot-start",
] as const;

export type TelegramHandoffMode = (typeof TELEGRAM_HANDOFF_MODES)[number];

export type TelegramOrderMessageInput = TelegramOrderPayload;

export interface TelegramConfig {
  target: string;
  targetLabel: string;
  username?: string | null;
  phone?: string | null;
  botUsername?: string | null;
  preferredMode: TelegramHandoffMode;
}

export interface TelegramOrderResult {
  url: string;
  message: string;
  mode: TelegramHandoffMode;
  targetLabel: string;
  startPayload?: string;
}

export interface TelegramStartPayloadInput {
  invoiceId: string;
  orderId?: string;
  source?: string;
  total?: number;
}

export interface TelegramOrderLineItem {
  productId: string;
  title: string;
  price: number;
  qty: number;
  lineTotal: number;
  imageUrl?: string | null;
  category?: string | null;
}

export interface TelegramOrderSummary {
  orderId?: string;
  invoiceId: string;
  shop: string;
  currency: CurrencyCode;
  items: TelegramOrderLineItem[];
  subtotal: number;
  total: number;
  customerName?: string | null;
  customerPhone?: string | null;
  note?: string | null;
}
