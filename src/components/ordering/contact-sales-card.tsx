import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import type { PersistedOrderSummary } from "@/types/order";

interface ContactSalesCardProps {
  order: PersistedOrderSummary;
  className?: string;
}

export function ContactSalesCard({ order, className }: ContactSalesCardProps) {
  const { locale } = useLocale();
  const orderingCopy = getUiText(locale).ordering;
  const continueUrl = order.salesDeeplink ?? order.modificationDeeplink ?? order.telegramUrl;

  return (
    <div className={`space-y-4 rounded-[1.5rem] border border-app-border bg-app-surface px-4 py-4 ${className ?? ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-app-surface-2 text-app-primary">
          <Phone className="size-5" />
        </div>
        <div>
          <p className="font-semibold text-app-text">{orderingCopy.chatWithSales}</p>
          <p className="text-sm text-app-text-muted">{orderingCopy.contactSalesHelpText}</p>
        </div>
      </div>
      <Button asChild className="w-full justify-center">
        <a href={continueUrl} target="_blank" rel="noreferrer">
          {orderingCopy.contactSales}
        </a>
      </Button>
    </div>
  );
}
