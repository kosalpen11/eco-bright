import type { OrderStatus } from "../../../../src/types/order";

export const ADMIN_CALLBACK_ACTIONS = [
  "accept",
  "reject",
  "clarify",
  "processing",
  "complete",
  "cancel",
  "reason",
  "note",
  "refresh",
] as const;

export type AdminCallbackAction = (typeof ADMIN_CALLBACK_ACTIONS)[number];

export interface AdminOrderMessageItem {
  title: string;
  qty: number;
  price: number;
  lineTotal: number;
}

export interface AdminOrderMessageInput {
  orderId: string;
  invoiceId: string;
  shop: string;
  source: string;
  currency: string;
  status: OrderStatus;
  createdAt: Date | string;
  customerName?: string | null;
  customerPhone?: string | null;
  note?: string | null;
  adminNote?: string | null;
  rejectionReason?: string | null;
  items: AdminOrderMessageItem[];
  subtotal: number;
  total: number;
}

export interface AdminStatusUpdateMessageInput {
  orderId: string;
  invoiceId: string;
  status: OrderStatus;
  action: string;
  reason?: string | null;
}

export interface AdminReasonPromptInput {
  orderId: string;
  invoiceId: string;
  mode: "reject" | "clarify" | "note";
}

export interface AdminKeyboardButton {
  text: string;
  callbackData: string;
}

export type AdminKeyboardLayout = AdminKeyboardButton[][];

export interface ParsedAdminAction {
  action: AdminCallbackAction;
  orderId: string;
}

export interface TelegramApiResponse {
  ok: boolean;
  description?: string;
  result?: {
    message_id?: number;
  };
}
