import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, CheckCircle2, Package, Truck } from "lucide-react";
import { OrderStatusCard } from "./order-status-card";
import { getTelegramTargetLabel } from "@/lib/telegram-order";
import type { PersistedOrderSummary } from "@/types/order";

interface TelegramHandoffCardProps {
  order: PersistedOrderSummary;
  onCopyOrder: () => void;
  className?: string;
}

export function TelegramHandoffCard({ order, onCopyOrder, className }: TelegramHandoffCardProps) {
  const { locale } = useLocale();
  const orderingCopy = getUiText(locale).ordering;
  const continueUrl = order.modificationDeeplink ?? order.telegramUrl;
  const telegramTargetLabel = getTelegramTargetLabel(continueUrl);
  const isKm = locale === "km";

  const fulfillmentLabel = order.fulfillmentMethod === "delivery"
    ? (isKm ? "ដឹកជញ្ជូន" : "Delivery")
    : order.fulfillmentMethod === "pickup"
    ? (isKm ? "មកយកដោយខ្លួនឯង" : "Pickup")
    : null;

  const FulfillmentIcon = order.fulfillmentMethod === "delivery" ? Truck : Package;

  return (
    <div className={`overflow-hidden rounded-[1.75rem] border border-[#0088cc]/30 bg-gradient-to-b from-[#0088cc]/10 to-[#0088cc]/5 ${className ?? ""}`}>
      {/* Header stripe */}
      <div className="flex items-center gap-3 border-b border-[#0088cc]/20 bg-[#0088cc]/10 px-5 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0088cc]/20 text-[#0088cc]">
          <CheckCircle2 className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#0088cc] uppercase tracking-wide">
            {orderingCopy.successStatusTitle}
          </p>
          <p className="mt-0.5 text-xs text-[#0088cc]/80">
            {isKm ? "ការបញ្ជាទិញត្រូវបានរក្សាទុករួច" : "Order saved in system"}
          </p>
        </div>
        <OrderStatusCard status={order.status} locale={locale} />
      </div>

      <div className="space-y-5 p-5">
        {/* Title + description */}
        <div>
          <h4 className="text-xl font-bold text-app-text">
            {orderingCopy.orderSavedTelegramNext}
          </h4>
          <p className="mt-2 text-sm leading-6 text-app-text-muted">
            {orderingCopy.successStatusDescription}
          </p>
        </div>

        {/* Order details grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-app-border bg-app-surface px-4 py-3">
            <p className="locale-label text-[11px] font-semibold uppercase text-app-text-faint">
              {isKm ? "លេខសម្គាល់ការបញ្ជាទិញ" : "Order Code"}
            </p>
            <p className="mt-1 font-bold text-app-text">
              {order.orderCode || order.shortOrderId || order.orderId.slice(0, 8)}
            </p>
          </div>

          {fulfillmentLabel ? (
            <div className="rounded-2xl border border-app-border bg-app-surface px-4 py-3">
              <p className="locale-label text-[11px] font-semibold uppercase text-app-text-faint">
                {isKm ? "របៀបទទួល" : "Fulfillment"}
              </p>
              <p className="mt-1 flex items-center gap-2 font-bold text-app-text">
                <FulfillmentIcon className="size-4 text-app-primary" />
                {fulfillmentLabel}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-app-border bg-app-surface px-4 py-3">
              <p className="locale-label text-[11px] font-semibold uppercase text-app-text-faint">
                {isKm ? "គោលដៅ" : "Chat with"}
              </p>
              <p className="mt-1 font-semibold text-app-text">{telegramTargetLabel}</p>
            </div>
          )}
        </div>

        {/* Handoff hint */}
        <div className="rounded-2xl border border-[#0088cc]/20 bg-[#0088cc]/5 px-4 py-3">
          <p className="text-xs font-semibold text-[#0088cc]">
            {orderingCopy.handoffHint}
          </p>
        </div>

        {/* Primary CTA — Continue in Telegram */}
        <Button
          asChild
          size="lg"
          className="h-14 w-full justify-center gap-3 rounded-2xl bg-[#0088cc] text-base font-bold text-white shadow-[0_4px_24px_rgba(0,136,204,0.3)] transition hover:bg-[#0077bb] hover:shadow-[0_4px_32px_rgba(0,136,204,0.4)]"
        >
          <a href={continueUrl} target="_blank" rel="noreferrer">
            <MessageCircle className="size-5" />
            {orderingCopy.continueInTelegram}
          </a>
        </Button>

        {/* Secondary CTA — Copy */}
        <button
          type="button"
          onClick={onCopyOrder}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm font-semibold text-app-text transition hover:bg-app-surface-3"
        >
          <Copy className="size-4" />
          {orderingCopy.copyOrder}
        </button>
      </div>
    </div>
  );
}
