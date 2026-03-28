import { formatInvoiceText } from "@/lib/invoice/invoice-text";
import { getInvoiceItemTitle } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";
import type { Invoice } from "@/types/invoice";

export function formatTelegramOrderMessage(
  invoice: Invoice,
  locale: Locale = "en",
) {
  return [
    locale === "km" ? `សួស្តី ${invoice.shop},` : `Hello ${invoice.shop},`,
    locale === "km" ? "ខ្ញុំចង់បញ្ជាទិញទំនិញដូចខាងក្រោម៖" : "I want to place this order:",
    "",
    `${locale === "km" ? "លេខវិក្កយបត្រ" : "Invoice ID"}: ${invoice.invoiceId}`,
    ...invoice.items.map(
      (item) =>
        `• ${getInvoiceItemTitle(item, locale)} — ${item.qty} x ${item.price.toFixed(2)} = ${item.lineTotal.toFixed(2)} ${invoice.currency}`,
    ),
    "",
    `${locale === "km" ? "សរុប" : "Total"}: ${invoice.total.toFixed(2)} ${invoice.currency}`,
  ].join("\n");
}

function normalizeTelegramInput(telegramUrl: string) {
  return telegramUrl.trim();
}

function normalizeTelegramDraftText(message: string) {
  const trimmed = message.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.startsWith("@") ? ` ${trimmed}` : trimmed;
}

function formatPhoneTarget(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");

  if (digits.startsWith("855") && digits.length === 11) {
    return `+855 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }

  return phone;
}

export function extractTelegramPhone(telegramUrl: string): string | null {
  const normalized = normalizeTelegramInput(telegramUrl);

  if (!normalized) {
    return null;
  }

  const candidate = normalized
    .replace(/^https?:\/\/t\.me\//, "")
    .replace(/^tg:\/\/resolve\?phone=/, "")
    .replace(/[^\d+]/g, "");

  if (/^\+\d{6,20}$/.test(candidate)) {
    return candidate;
  }

  return null;
}

export function extractTelegramUsername(telegramUrl: string): string | null {
  const normalized = normalizeTelegramInput(telegramUrl);

  if (!normalized) {
    return null;
  }

  if (extractTelegramPhone(normalized)) {
    return null;
  }

  if (normalized.startsWith("@")) {
    return normalized.slice(1);
  }

  try {
    const url = new URL(
      normalized.startsWith("http://") || normalized.startsWith("https://")
        ? normalized
        : `https://${normalized}`,
    );
    const segments = url.pathname.split("/").filter(Boolean);
    const username = segments[0]?.replace(/^@/, "");

    return username || null;
  } catch {
    return normalized.replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "") || null;
  }
}

export function getTelegramTargetLabel(telegramUrl: string) {
  const phone = extractTelegramPhone(telegramUrl);

  if (phone) {
    return formatPhoneTarget(phone);
  }

  const username = extractTelegramUsername(telegramUrl);

  if (username) {
    return `@${username}`;
  }

  return telegramUrl;
}

export function buildTelegramContactUrl(telegramUrl: string, message?: string): string {
  const phone = extractTelegramPhone(telegramUrl);
  const draftText = normalizeTelegramDraftText(message ?? "");
  const textQuery = draftText ? `?text=${encodeURIComponent(draftText)}` : "";

  if (phone) {
    return `https://t.me/${phone}${textQuery}`;
  }

  const username = extractTelegramUsername(telegramUrl);

  if (!username) {
    return telegramUrl;
  }

  return `https://t.me/${username}${textQuery}`;
}

export function buildTelegramShareUrl(telegramUrl: string, message: string): string {
  const url = encodeURIComponent(telegramUrl);
  const text = encodeURIComponent(message);

  return `https://t.me/share/url?url=${url}&text=${text}`;
}

export function getTelegramShareUrl(invoice: Invoice, locale: Locale = "en"): string {
  return buildTelegramShareUrl(invoice.telegramUrl, formatInvoiceText(invoice, locale));
}
