import type { Invoice } from "@/types/invoice";

export function encodeInvoiceQr(invoice: Invoice) {
  return JSON.stringify({
    invoiceId: invoice.invoiceId,
    shop: invoice.shop,
    currency: invoice.currency,
    items: invoice.items.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      qty: item.qty,
    })),
    subtotal: invoice.subtotal,
    total: invoice.total,
    telegram: invoice.telegramUrl,
  });
}
