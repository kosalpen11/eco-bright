"use client";

import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";

interface CheckoutMessagePreviewProps {
  message: string;
}

export function CheckoutMessagePreview({ message }: CheckoutMessagePreviewProps) {
  const { locale } = useLocale();
  const copy = getUiText(locale).checkout;

  return (
    <div className="rounded-[1.6rem] border border-app-border bg-app-surface-2 p-4">
      <div className="mb-3 text-sm font-semibold text-app-text">{copy.messagePreview}</div>
      <pre className="whitespace-pre-wrap break-words rounded-[1.2rem] bg-app-surface p-4 text-sm leading-6 text-app-text-soft">
        {message}
      </pre>
    </div>
  );
}
