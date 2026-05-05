import { getUiText } from "@/lib/i18n";
import { type Locale } from "@/lib/locale";
import type { OrderStatus } from "@/types/order";
import { CheckCircle2, Clock, XCircle, AlertCircle, Package } from "lucide-react";

interface OrderStatusCardProps {
  status: OrderStatus;
  locale: Locale;
  className?: string;
}

export function OrderStatusCard({ status, locale, className }: OrderStatusCardProps) {
  const ui = getUiText(locale);
  const copy = ui.invoice;

  let Icon = Clock;
  let colorClass = "text-amber-500 bg-amber-500/10 border-amber-500/20";

  switch (status) {
    case "draft":
    case "pending":
      Icon = Clock;
      colorClass = "text-amber-500 bg-amber-500/10 border-amber-500/20";
      break;
    case "accepted":
    case "processing":
      Icon = Package;
      colorClass = "text-blue-500 bg-blue-500/10 border-blue-500/20";
      break;
    case "completed":
      Icon = CheckCircle2;
      colorClass = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      break;
    case "rejected":
    case "cancelled":
      Icon = XCircle;
      colorClass = "text-red-500 bg-red-500/10 border-red-500/20";
      break;
    case "needs_clarification":
      Icon = AlertCircle;
      colorClass = "text-orange-500 bg-orange-500/10 border-orange-500/20";
      break;
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold capitalize ${colorClass} ${className ?? ""}`}>
      <Icon className="size-4" />
      {copy[status]}
    </div>
  );
}
