import type { CurrencyCode } from "../../../src/types/invoice";
import type { OrderSource, OrderStatus } from "../../../src/types/order";

export interface OrderCoreItemInput {
  productId: string;
  title: string;
  price: number;
  qty: number;
  imageUrl?: string | null;
  category?: string | null;
}

export interface CreateDraftOrderInput {
  shop: string;
  currency: CurrencyCode;
  source: OrderSource;
  items: OrderCoreItemInput[];
  orderCode?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  note?: string | null;
  telegramUrl?: string | null;
  telegramMessage?: string | null;
  telegramCustomerUserId?: string | null;
  telegramCustomerUsername?: string | null;
  telegramCustomerChatId?: string | null;
}

export interface UpdateDraftOrderItemsInput {
  orderId: string;
  items: OrderCoreItemInput[];
  orderCode?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  note?: string | null;
  telegramCustomerUserId?: string | null;
  telegramCustomerUsername?: string | null;
  telegramCustomerChatId?: string | null;
}

export interface FinalizeOrderInput {
  orderId: string;
  status?: OrderStatus;
  customerName?: string | null;
  customerPhone?: string | null;
  note?: string | null;
  telegramUrl?: string | null;
  telegramMessage?: string | null;
  telegramCustomerUserId?: string | null;
  telegramCustomerUsername?: string | null;
  telegramCustomerChatId?: string | null;
}

export interface OrderInvoiceSummary {
  orderId: string;
  invoiceId: string;
  shop: string;
  currency: CurrencyCode;
  subtotal: number;
  total: number;
  itemCount: number;
  status: OrderStatus;
  items: Array<{
    productId: string;
    title: string;
    qty: number;
    price: number;
    lineTotal: number;
  }>;
}
