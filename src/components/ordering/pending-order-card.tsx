import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, Phone, Package, Truck, AlertCircle } from "lucide-react";
import { OrderStatusCard } from "./order-status-card";
import type { PersistedOrderSummary } from "@/types/order";

interface PendingOrderCardProps {
  order: PersistedOrderSummary;
  onCopyOrder: () => void;
  className?: string;
}

export function PendingOrderCard({ order, onCopyOrder, className }: PendingOrderCardProps) {
  const { locale } = useLocale();
  const orderingCopy = getUiText(locale).ordering;
  const salesUrl = order.salesDeeplink ?? order.modificationDeeplink ?? order.telegramUrl;
  const continueUrl = order.modificationDeeplink ?? order.telegramUrl;
  const isKm = locale === "km";

  const fulfillmentLabel = order.fulfillmentMethod === "delivery"
    ? (isKm ? "ដឹកជញ្ជូន" : "Delivery")
    : order.fulfillmentMethod === "pickup"
    ? (isKm ? "មកយកដោយខ្លួនឯង" : "Pickup")
    : null;

  const FulfillmentIcon = order.fulfillmentMethod === "delivery" ? Truck : Package;

  return (
    <div className={`overflow-hidden rounded-[1.75rem] border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-amber-500/5 ${className ?? ""}`}>
      {/* Header stripe */}
      <div className="flex items-center gap-3 border-b border-amber-500/20 bg-amber-500/10 px-5 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
          <AlertCircle className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-amber-500 uppercase tracking-wide">
            {isKm ? "ការបញ្ជាទិញកំពុងរង់ចាំ" : "Pending Confirmation"}
          </p>
          <p className="mt-0.5 text-xs text-amber-500/80">
            {isKm ? "ត្រូវការការបញ្ជាក់ពីផ្នែកលក់" : "Requires sales team confirmation"}
          </p>
        </div>
        <OrderStatusCard status={order.status} locale={locale} />
      </div>

      <div className="space-y-5 p-5">
        {/* Title + description */}
        <div>
          <h4 className="text-xl font-bold text-app-text">
            {orderingCopy.pendingStatusTitle}
          </h4>
          <p className="mt-2 text-sm leading-6 text-app-text-muted">
            {orderingCopy.pendingStatusDescription}
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
                {isKm ? "លេខវិក្កយបត្រ" : "Invoice ID"}
              </p>
              <p className="mt-1 truncate font-mono text-sm font-semibold text-app-text">
                {order.invoiceId.slice(-12)}
              </p>
            </div>
          )}
        </div>

        {/* Step hint */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            {isKm
              ? "ជំហាន: ចុច Contact Sales → ជជែកជាមួយក្រុមលក់ → ដំណើរការបញ្ជាទិញ"
              : "Next steps: Tap Contact Sales → Chat with our team → We'll process your order"}
          </p>
        </div>

        {/* Primary CTA — Contact Sales (full width, dominant) */}
        <Button
          asChild
          size="lg"
          className="h-14 w-full justify-center gap-3 rounded-2xl bg-amber-500 text-base font-bold text-white shadow-[0_4px_24px_rgba(245,158,11,0.35)] transition hover:bg-amber-600 hover:shadow-[0_4px_32px_rgba(245,158,11,0.45)]"
        >
          <a href={salesUrl} target="_blank" rel="noreferrer">
            <Phone className="size-5" />
            {orderingCopy.contactSales}
          </a>
        </Button>

        {/* Secondary row */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCopyOrder}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm font-semibold text-app-text transition hover:bg-app-surface-3"
          >
            <Copy className="size-4" />
            {orderingCopy.copyOrder}
          </button>
          <a
            href={continueUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#0088cc]/30 bg-[#0088cc]/10 px-4 py-3 text-sm font-semibold text-[#0088cc] transition hover:bg-[#0088cc]/20"
          >
            <MessageCircle className="size-4" />
            Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
