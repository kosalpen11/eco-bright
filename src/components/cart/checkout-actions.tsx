"use client";

import { ExternalLink, MessageSquareText } from "lucide-react";

import { useLocale } from "@/components/locale/locale-provider";
import { Button } from "@/components/ui/button";
import { getUiText } from "@/lib/i18n";

interface CheckoutActionsProps {
  onCopyMessage: () => void;
  onOpenTelegram: () => void;
  disabled?: boolean;
}

export function CheckoutActions({
  onCopyMessage,
  onOpenTelegram,
  disabled = false,
}: CheckoutActionsProps) {
  const { locale } = useLocale();
  const copy = getUiText(locale).checkout;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Button type="button" variant="accent" onClick={onCopyMessage} disabled={disabled}>
        <MessageSquareText className="size-4" />
        {copy.copyMessage}
      </Button>
      <Button type="button" variant="surface" onClick={onOpenTelegram} disabled={disabled}>
        <ExternalLink className="size-4" />
        {copy.buyNow}
      </Button>
    </div>
  );
}
