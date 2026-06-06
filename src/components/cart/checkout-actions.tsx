"use client";

import { ExternalLink, MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";

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
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Button type="button" variant="accent" onClick={onCopyMessage} disabled={disabled}>
        <MessageSquareText className="size-4" />
        Copy message
      </Button>
      <Button type="button" variant="surface" onClick={onOpenTelegram} disabled={disabled}>
        <ExternalLink className="size-4" />
        Open Telegram
      </Button>
    </div>
  );
}
