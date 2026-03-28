import { getInvoiceItemTitle, getUiText } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";
import type { Invoice } from "@/types/invoice";

export function formatInvoiceTimestamp(value: string, locale: Locale = "en") {
  return new Intl.DateTimeFormat(locale === "km" ? "km-KH" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatInvoiceText(invoice: Invoice, locale: Locale = "en"): string {
  const copy = getUiText(locale).invoice;
  const lines = [
    `${invoice.shop}`,
    `${copy.invoiceId}: ${invoice.invoiceId}`,
    `${copy.created}: ${formatInvoiceTimestamp(invoice.createdAtIso, locale)}`,
    "",
    `${copy.items}:`,
    ...invoice.items.map(
      (item) =>
        `- ${getInvoiceItemTitle(item, locale)} | ${item.qty} x ${item.price.toFixed(2)} = ${item.lineTotal.toFixed(2)}`,
    ),
    "",
    `${copy.subtotal}: ${invoice.subtotal.toFixed(2)} ${invoice.currency}`,
    `${copy.total}: ${invoice.total.toFixed(2)} ${invoice.currency}`,
    `${copy.telegram}: ${invoice.telegramUrl}`,
  ];

  return lines.join("\n");
}
