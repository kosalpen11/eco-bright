"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocale } from "@/components/locale/locale-provider";
import { OrderSuccessSheet } from "@/components/cart/order-success-sheet";
import { Button } from "@/components/ui/button";
import { clearCheckoutFormStorage } from "@/lib/cart-storage";
import { createOrderPayload } from "@/lib/ordering/create-order-payload";
import { getUiText } from "@/lib/i18n";
import { useCartStore } from "@/store/cart-store";
import type { Invoice } from "@/types/invoice";
import type { OrderSource, PersistedOrderSummary } from "@/types/order";

interface OrderButtonProps {
  invoice: Invoice | null;
  source: OrderSource;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  fulfillmentMethod?: "pickup" | "delivery" | "";
  disabled?: boolean;
  className?: string;
}

interface CreateOrderResponse extends PersistedOrderSummary {
  ok: true;
}

interface ErrorResponse {
  ok: false;
  message?: string;
  issues?: Array<{
    path?: string;
    message?: string;
    code?: string;
    title?: string;
  }>;
}

async function requestCreateOrder(payload: ReturnType<typeof createOrderPayload>) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | CreateOrderResponse
    | ErrorResponse
    | null;

  if (!response.ok || !data?.ok) {
    const issues =
      data && "issues" in data && Array.isArray(data.issues)
        ? data.issues
            .map((issue) =>
              issue?.path && issue?.message
                ? `${issue.path}: ${issue.message}`
                : issue?.message ??
                  (issue?.title && issue?.code
                    ? `${issue.title}: ${issue.code.replace(/_/g, " ")}`
                    : issue?.title),
            )
            .filter((issue): issue is string => Boolean(issue))
        : [];
    const message =
      issues[0] ??
      (data && "message" in data ? data.message : undefined) ??
      "Failed to create order";
    throw new Error(message);
  }

  return data;
}

export function OrderButton({
  invoice,
  source,
  customerName,
  customerPhone,
  note,
  fulfillmentMethod,
  disabled,
  className,
}: OrderButtonProps) {
  const { locale } = useLocale();
  const orderingCopy = getUiText(locale).ordering;
  const refreshInvoiceSession = useCartStore((state) => state.refreshInvoiceSession);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PersistedOrderSummary | null>(null);
  const [successInvoice, setSuccessInvoice] = useState<Invoice | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const requestPayload = useMemo(
    () =>
      invoice && customerPhone?.trim() && fulfillmentMethod
        ? createOrderPayload({
            invoice,
            customerName,
            customerPhone,
            note,
            fulfillmentMethod,
            source,
          })
        : null,
    [customerName, customerPhone, fulfillmentMethod, invoice, note, source],
  );

  async function handleOrder() {
    if (!requestPayload) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const createdOrder = await requestCreateOrder(requestPayload);
      setSuccessInvoice(invoice);
      setResult(createdOrder);
      setSheetOpen(true);
      refreshInvoiceSession("web");
      // Clear form state after successful order creation
      clearCheckoutFormStorage();
    } catch (createError) {
      setError(
        createError instanceof Error && createError.message !== "Failed to create order"
          ? createError.message
          : orderingCopy.orderFailed,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className={className}>
        <Button
          type="button"
          size="lg"
          onClick={handleOrder}
          disabled={!requestPayload || isSubmitting || disabled}
          className="w-full justify-center"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              {orderingCopy.creatingOrder}
            </>
          ) : (
            <>
              {orderingCopy.checkoutConfirmTelegram}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        {error ? <p className="mt-3 text-sm text-app-danger">{error}</p> : null}
      </div>

      {successInvoice && result ? (
        <OrderSuccessSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          invoice={successInvoice}
          order={result}
        />
      ) : null}
    </>
  );
}
