"use client";

import QRCode from "react-qr-code";
import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";
import { encodeInvoiceQr } from "@/lib/qr";
import type { Invoice } from "@/types/invoice";

interface InvoiceQrProps {
  invoice: Invoice;
  layout?: "responsive" | "wide";
}

export function InvoiceQr({ invoice, layout = "responsive" }: InvoiceQrProps) {
  const { locale } = useLocale();
  const copy = getUiText(locale).invoice;
  const payload = encodeInvoiceQr(invoice);
  const isWide = layout === "wide";

  return (
    <div
      className={
        isWide
          ? "grid gap-4 grid-cols-[168px_minmax(0,1fr)] items-center"
          : "grid gap-4 md:grid-cols-[168px_minmax(0,1fr)] md:items-center"
      }
    >
      <div className="flex justify-center rounded-[1.5rem] border border-app-qr-border bg-white p-4">
        <QRCode value={payload} size={isWide ? 148 : 136} />
      </div>

      <div className="space-y-3 text-app-qr-text">
        <div>
          <p className="locale-label text-xs font-semibold uppercase text-app-qr-muted">
            {copy.qrInvoice}
          </p>
          <h4 className="mt-1 text-lg font-bold text-app-qr-text">{copy.scanOrShare}</h4>
        </div>

        <div className={isWide ? "grid gap-3 grid-cols-2" : "grid gap-3 sm:grid-cols-2"}>
          <div className="rounded-[1.25rem] border border-app-qr-border bg-app-qr-surface p-3">
            <p className="locale-label text-[11px] uppercase text-app-qr-muted">{copy.total}</p>
            <p className="mt-1 text-sm font-semibold text-app-qr-text">
              {invoice.currency} {invoice.total.toFixed(2)}
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-app-qr-border bg-app-qr-surface p-3">
            <p className="font-semibold text-app-qr-text">{copy.invoiceId}</p>
            <p className="mt-1 break-all text-sm text-app-qr-muted">{invoice.invoiceId}</p>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-app-qr-border bg-app-qr-surface p-3 text-sm text-app-qr-muted">
          <p className="font-semibold text-app-qr-text">{copy.includedInQr}</p>
          <p className="mt-1">{copy.qrDescription}</p>
        </div>
      </div>
    </div>
  );
}
