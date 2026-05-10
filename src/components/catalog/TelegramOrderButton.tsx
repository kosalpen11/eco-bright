"use client";

import { useRef, useState } from "react";

import { TELEGRAM_OWNER_URL } from "@/lib/constants";
import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";

async function copyText(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "true");
  el.style.position = "fixed";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

function buildTelegramChatLink(baseUrl: string, message: string) {
  // Prefer direct chat (not share/forward flow). We still copy message to clipboard.
  try {
    const url = new URL(baseUrl);
    // Some Telegram clients respect `?text=` for usernames; if not, clipboard still works.
    url.searchParams.set("text", message);
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function TelegramOrderButton({
  productId,
  productName,
  priceText,
  className,
}: {
  productId: string;
  productName: string;
  priceText: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { locale } = useLocale();
  const copy = getUiText(locale).catalog;

  async function onClick() {
    const message =
      locale === "km"
        ? [
            "🛒 សំណើបញ្ជាទិញ",
            "━━━━━━━━━━━━━━",
            `ផលិតផល: ${productName} (${productId}) x 1`,
            `តម្លៃ: ${priceText}`,
            "━━━━━━━━━━━━━━",
            "សួស្តី! ខ្ញុំចាប់អារម្មណ៍ទិញផលិតផលនេះ។ តើនៅមានស្តុកទេ?",
          ].join("\n")
        : [
            "🛒 Order Request",
            "━━━━━━━━━━━━━━",
            `Product: ${productName} (${productId}) x 1`,
            `Price: ${priceText}`,
            "━━━━━━━━━━━━━━",
            "Hi! I'm interested in this product. Is it in stock?",
          ].join("\n");

    // Always copy first so the user can paste even if Telegram doesn't prefill.
    try {
      await copyText(message);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }

    const href = buildTelegramChatLink(TELEGRAM_OWNER_URL, message);
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className ??
        "inline-flex h-9 w-full items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-700 transition-colors hover:border-amber-700 hover:bg-amber-50 hover:text-amber-700"
      }
    >
      {copied ? copy.copiedMessage : copy.requestOrder}
    </button>
  );
}
