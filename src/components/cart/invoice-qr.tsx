"use client";

import QRCode from "react-qr-code";
import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";
import { encodeInvoiceQr } from "@/lib/qr";
import type { Invoice } from "@/types/invoice";

interface InvoiceQrProps {
  invoice: Invoice;
}

export function InvoiceQr({ invoice }: InvoiceQrProps) {
  const { locale } = useLocale();
  const copy = getUiText(locale).invoice;
  const payload = encodeInvoiceQr(invoice);

  return (
    <div className="space-y-4 text-app-qr-text">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="locale-label text-xs font-semibold uppercase text-app-qr-muted">
            {copy.qrInvoice}
          </p>
          <h4 className="mt-1 text-lg font-bold text-app-qr-text">{copy.scanOrShare}</h4>
        </div>
        <div className="rounded-xl bg-app-qr-surface px-3 py-2 text-right">
          <p className="locale-label text-[11px] uppercase text-app-qr-muted">{copy.total}</p>
          <p className="text-sm font-semibold text-app-qr-text">
            {invoice.currency} {invoice.total.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
        <div className="flex justify-center rounded-2xl border border-app-qr-border p-4">
          <QRCode value={payload} size={160} />
        </div>

        <div className="space-y-2 text-sm text-app-qr-muted">
          <div className="rounded-2xl bg-app-qr-surface p-3">
            <p className="font-semibold text-app-qr-text">{copy.invoiceId}</p>
            <p className="mt-1 break-all">{invoice.invoiceId}</p>
          </div>

          <div className="rounded-2xl bg-app-qr-surface p-3">
            <p className="font-semibold text-app-qr-text">{copy.includedInQr}</p>
            <p className="mt-1">{copy.qrDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
