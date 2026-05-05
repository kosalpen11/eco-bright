import type { Product } from "../../../src/types/product";
import type { TelegramStartPayload } from "../../shared/src";

export type { TelegramStartPayload };

export interface TelegramBotLinkInput {
  botUsername: string;
  payload: string;
}

export interface TelegramFallbackLinkInput {
  botUsername: string;
  referenceId: string;
}

export interface TelegramOrderSummaryInput {
  orderId: string;
  invoiceId: string;
  shop: string;
  currency: string;
  items: Array<{
    title: string;
    qty: number;
    price: number;
    lineTotal: number;
  }>;
  subtotal: number;
  total: number;
  customerName?: string | null;
  customerPhone?: string | null;
  note?: string | null;
}

export interface TelegramProductMessageInput {
  product: Product;
  quantity?: number;
}
