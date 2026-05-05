"use client";

import { useRef, useState } from "react";

async function copyText(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for older browsers / restricted clipboard APIs.
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

export function CopyProductButton({
  productId,
  productName,
  className,
}: {
  productId: string;
  productName: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function onCopy() {
    const text = `${productId} | ${productName}`;
    try {
      await copyText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 900);
    } catch {
      // Silently ignore clipboard failures; no crash.
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={
        className ??
        "inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition-colors hover:border-amber-700 hover:bg-amber-50 hover:text-amber-700"
      }
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

