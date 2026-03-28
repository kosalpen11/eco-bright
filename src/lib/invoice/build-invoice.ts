import { CURRENCY, SHOP_NAME, TELEGRAM_CHECKOUT_URL } from "@/lib/constants";
import type { CartItem, InvoiceMeta } from "@/types/cart";
import type { Invoice, InvoiceItem, InvoicePayload } from "@/types/invoice";

export function createInvoiceMeta(now = new Date()): InvoiceMeta {
  const year = now.getFullYear();
  const isoDigits = now.toISOString().replace(/\D/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();

  return {
    invoiceId: `INV-${year}-${isoDigits}-${suffix}`,
    createdAtIso: now.toISOString(),
  };
}

export function getCartCount(items: Pick<CartItem, "qty">[]) {
  return items.reduce((total, item) => total + item.qty, 0);
}

export function getCartSubtotal(items: Pick<CartItem, "price" | "qty">[]) {
  return items.reduce((total, item) => total + item.price * item.qty, 0);
}

function toInvoiceItems(items: CartItem[]): InvoiceItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    titleKm: item.titleKm,
    price: item.price,
    qty: item.qty,
    lineTotal: item.price * item.qty,
  }));
}

function createInvoicePayload(invoice: Omit<Invoice, "payload" | "telegramUrl">): InvoicePayload {
  return {
    invoiceId: invoice.invoiceId,
    shop: invoice.shop,
    currency: invoice.currency,
    createdAtIso: invoice.createdAtIso,
    items: invoice.items.map(({ id, title, price, qty }) => ({
      id,
      title,
      price,
      qty,
    })),
    subtotal: invoice.subtotal,
    total: invoice.total,
    telegram: TELEGRAM_CHECKOUT_URL,
  };
}

export function buildInvoice(
  items: CartItem[],
  invoiceMeta: InvoiceMeta | null,
): Invoice | null {
  if (!items.length || !invoiceMeta) {
    return null;
  }

  const invoiceItems = toInvoiceItems(items);
  const subtotal = invoiceItems.reduce((total, item) => total + item.lineTotal, 0);
  const total = subtotal;

  const baseInvoice = {
    invoiceId: invoiceMeta.invoiceId,
    shop: SHOP_NAME,
    currency: CURRENCY,
    createdAtIso: invoiceMeta.createdAtIso,
    items: invoiceItems,
    subtotal,
    total,
  } as const;

  return {
    ...baseInvoice,
    telegramUrl: TELEGRAM_CHECKOUT_URL,
    payload: createInvoicePayload(baseInvoice),
  };
}
