"use client";

import { Copy, ImageUp, MessageCircle, Share2 } from "lucide-react";
import { getFontEmbedCSS, toPng } from "html-to-image";
import { useMemo, useState } from "react";
import { useLocale } from "@/components/locale/locale-provider";
import { formatInvoiceText } from "@/lib/invoice-text";
import { getUiText } from "@/lib/i18n";
import { copyText, shareText } from "@/lib/share";
import {
  buildTelegramContactUrl,
  formatTelegramOrderMessage,
  getTelegramTargetLabel,
} from "@/lib/telegram";
import type { Invoice } from "@/types/invoice";

interface ShareInvoiceActionsProps {
  invoice: Invoice | null;
  disabled?: boolean;
  exportTargetId: string;
  className?: string;
}

const fontEmbedCssCache = new Map<string, string | null>();

function downloadDataUrl(filename: string, dataUrl: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

async function getSafeFontEmbedCss(node: HTMLElement, locale: string) {
  if (fontEmbedCssCache.has(locale)) {
    return fontEmbedCssCache.get(locale) ?? undefined;
  }

  try {
    const fontEmbedCss = await getFontEmbedCSS(node, {
      preferredFontFormat: "woff2",
    });
    fontEmbedCssCache.set(locale, fontEmbedCss);
    return fontEmbedCss;
  } catch {
    fontEmbedCssCache.set(locale, null);
    return undefined;
  }
}

export function ShareInvoiceActions({
  invoice,
  disabled = false,
  exportTargetId,
  className,
}: ShareInvoiceActionsProps) {
  const { locale } = useLocale();
  const copy = getUiText(locale).invoice;
  const [feedback, setFeedback] = useState<string | null>(null);
  const text = useMemo(() => (invoice ? formatInvoiceText(invoice, locale) : ""), [invoice, locale]);
  const telegramText = useMemo(
    () => (invoice ? formatTelegramOrderMessage(invoice, locale) : ""),
    [invoice, locale],
  );
  const telegramContactUrl = useMemo(
    () =>
      invoice ? buildTelegramContactUrl(invoice.telegramUrl, telegramText) : undefined,
    [invoice, telegramText],
  );
  const telegramTargetLabel = useMemo(
    () => (invoice ? getTelegramTargetLabel(invoice.telegramUrl) : ""),
    [invoice],
  );

  async function handleCopy() {
    if (!invoice) {
      return;
    }

    try {
      const copied = await copyText(text);
      setFeedback(copied ? copy.invoiceCopied : copy.copyFailed);
    } catch {
      setFeedback(copy.copyFailed);
    }
  }

  async function handleShare() {
    if (!invoice) {
      return;
    }

    try {
      const shared = await shareText({
        title: copy.invoice,
        text,
      });

      if (!shared) {
        const copied = await copyText(text);
        setFeedback(copied ? copy.sharedNotSupported : copy.shareFailed);
        return;
      }

      setFeedback(copy.invoiceShared);
    } catch {
      setFeedback(copy.shareFailed);
    }
  }

  async function handleExportImage() {
    if (!invoice) {
      return;
    }

    try {
      const node = document.getElementById(exportTargetId);
      if (!node) {
        setFeedback(copy.invoiceImageTargetMissing);
        return;
      }

      const backgroundColor = window.getComputedStyle(node).backgroundColor;
      const exportOptions = {
        backgroundColor,
        cacheBust: true,
        pixelRatio: 2,
        preferredFontFormat: "woff2" as const,
      };
      const fontEmbedCSS = await getSafeFontEmbedCss(node, locale);

      let dataUrl: string;

      try {
        dataUrl = await toPng(node, {
          ...exportOptions,
          ...(fontEmbedCSS ? { fontEmbedCSS } : {}),
        });
      } catch (error) {
        const shouldRetryWithoutFonts =
          (error instanceof DOMException && error.name === "SecurityError") ||
          (error instanceof Error && error.message.includes("cssRules"));

        if (!shouldRetryWithoutFonts) {
          throw error;
        }

        dataUrl = await toPng(node, {
          ...exportOptions,
          skipFonts: true,
        });
      }

      downloadDataUrl(`${invoice.invoiceId}.png`, dataUrl);
      setFeedback(copy.invoiceImageExported());
    } catch {
      setFeedback(copy.imageExportFailed);
    }
  }

  async function handleTelegram() {
    if (!invoice || !telegramContactUrl) {
      return;
    }

    try {
      const copied = await copyText(telegramText);
      window.open(telegramContactUrl, "_blank", "noopener,noreferrer");
      setFeedback(
        copied
          ? copy.telegramOpened(telegramTargetLabel)
          : copy.telegramOpenedWithoutCopy(telegramTargetLabel),
      );
    } catch {
      try {
        window.open(telegramContactUrl, "_blank", "noopener,noreferrer");
        setFeedback(copy.telegramOpenedWithoutCopy(telegramTargetLabel));
      } catch {
        setFeedback(copy.telegramOpenFailed);
      }
    }
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={handleCopy}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm font-semibold text-app-text-soft transition hover:bg-app-surface-3 hover:text-app-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Copy className="h-4 w-4" />
          {copy.copy}
        </button>

        <button
          type="button"
          onClick={handleShare}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-app-secondary bg-app-secondary-soft px-4 py-3 text-sm font-semibold text-app-secondary transition hover:bg-app-surface-3 hover:text-app-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Share2 className="h-4 w-4" />
          {copy.share}
        </button>

        <button
          type="button"
          onClick={handleExportImage}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-app-accent bg-app-accent-soft px-4 py-3 text-sm font-semibold text-app-accent transition hover:bg-app-surface-3 hover:text-app-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImageUp className="h-4 w-4" />
          {copy.image}
        </button>

        <button
          type="button"
          onClick={handleTelegram}
          disabled={disabled || !telegramContactUrl}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-app-primary bg-app-primary-soft px-4 py-3 text-sm font-semibold text-app-primary transition hover:bg-app-surface-3 hover:text-app-text disabled:cursor-not-allowed disabled:border-app-border disabled:bg-app-surface-2 disabled:text-app-text-faint"
        >
          <MessageCircle className="h-4 w-4" />
          {copy.telegram}
        </button>
      </div>

      <p className="mt-3 text-sm text-app-text-muted">
        {feedback || (telegramTargetLabel ? copy.checkoutHint(telegramTargetLabel) : null)}
      </p>
    </div>
  );
}
