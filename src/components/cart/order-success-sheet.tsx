"use client";

import { useState } from "react";
import { useLocale } from "@/components/locale/locale-provider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getUiText } from "@/lib/i18n";
import { copyText } from "@/lib/share";
import { PendingOrderCard } from "@/components/ordering/pending-order-card";
import { TelegramHandoffCard } from "@/components/ordering/telegram-handoff-card";
import type { Invoice } from "@/types/invoice";
import type { PersistedOrderSummary } from "@/types/order";

interface OrderSuccessSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  order: PersistedOrderSummary;
}

export function OrderSuccessSheet({
  open,
  onOpenChange,
  invoice,
  order,
}: OrderSuccessSheetProps) {
  const { locale } = useLocale();
  const orderingCopy = getUiText(locale).ordering;
  const isPending = order.status === "pending" || order.status === "draft";
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCopyOrder = async () => {
    try {
      if (order.telegramMessage) {
        await copyText(order.telegramMessage);
        setFeedback(orderingCopy.copySuccess);
      } else {
        await copyText(`${orderingCopy.orderId}: ${order.shortOrderId}`);
        setFeedback(orderingCopy.copySuccess);
      }
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback(orderingCopy.copyFailed);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-auto rounded-t-[2rem] pb-10 pt-8 px-4 sm:px-6">
        <SheetHeader className="sr-only">
          <SheetTitle>Order Status</SheetTitle>
          <SheetDescription>View your order status and next steps.</SheetDescription>
        </SheetHeader>

        <div className="mx-auto max-w-2xl space-y-4">
          {isPending ? (
            <PendingOrderCard order={order} onCopyOrder={handleCopyOrder} />
          ) : (
            <TelegramHandoffCard order={order} onCopyOrder={handleCopyOrder} />
          )}

          {feedback ? (
            <p className="text-center text-sm font-semibold text-app-primary animate-in fade-in">
              {feedback}
            </p>
          ) : null}

          {order.alreadyExists ? (
            <p className="text-center text-xs text-app-text-muted">
              {locale === "km"
                ? "ការបញ្ជាទិញនេះមានរួចហើយ — ត្រូវបានស្ដារឡើងវិញ"
                : "This order already existed — restored from system"}
            </p>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
