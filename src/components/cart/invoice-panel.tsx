"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronUp,
  ReceiptText,
  ScrollText,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { InvoiceQr } from "@/components/cart/invoice-qr";
import { ShareInvoiceActions } from "@/components/cart/share-invoice-actions";
import { useLocale } from "@/components/locale/locale-provider";
import { TELEGRAM_CHECKOUT_URL } from "@/lib/constants";
import { formatCurrency } from "@/lib/currency";
import {
  formatItemCount,
  getInvoiceItemTitle,
  getUiText,
} from "@/lib/i18n";
import { buildInvoice, getCartCount } from "@/lib/invoice";
import { formatInvoiceText, formatInvoiceTimestamp } from "@/lib/invoice-text";
import type { Locale } from "@/lib/locale";
import { encodeInvoiceQr } from "@/lib/qr";
import { getTelegramTargetLabel } from "@/lib/telegram";
import { useCartStore } from "@/store/cart-store";
import type { Invoice } from "@/types/invoice";

interface InvoiceCardProps {
  exportTargetId: string;
  hasHydrated: boolean;
  invoice: Invoice | null;
  totalCount: number;
  clearCart: () => void;
  locale: Locale;
  reviewOpen: boolean;
  onOpenReview: () => void;
  onBackToAdjustItems: () => void;
  stickyActions?: boolean;
}

interface InvoicePaperPreviewProps {
  invoice: Invoice;
  locale: Locale;
}

interface InvoicePaperDocumentProps {
  id?: string;
  invoice: Invoice;
  locale: Locale;
  className?: string;
  variant?: "preview" | "export";
}

function InvoicePaperDocument({
  id,
  invoice,
  locale,
  className,
  variant = "preview",
}: InvoicePaperDocumentProps) {
  const ui = getUiText(locale);
  const copy = ui.invoice;
  const cartCopy = ui.cart;
  const targetLabel = getTelegramTargetLabel(invoice.telegramUrl);
  const isExport = variant === "export";

  if (isExport) {
    const qrPayload = encodeInvoiceQr(invoice);

    return (
      <div
        id={id}
        className={`rounded-[2rem] border border-neutral-200 bg-white p-7 text-neutral-950 shadow-[0_20px_60px_rgba(15,23,42,0.12)] ${className ?? ""}`}
      >
        <div className="border-b border-neutral-200 pb-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-lime-700">
            {invoice.shop}
          </p>

          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h4 className="text-[2.25rem] font-bold tracking-tight text-neutral-950">
                {copy.invoice}
              </h4>
              <p className="mt-2 text-sm text-neutral-500">{copy.orderSummary}</p>
            </div>

            <div className="text-right">
              <p className="locale-label text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {copy.total}
              </p>
              <p className="mt-2 text-2xl font-bold text-neutral-950">
                {formatCurrency(invoice.total)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="locale-label font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {copy.invoiceId}
              </span>
              <span className="max-w-[420px] text-right font-semibold text-neutral-950">
                {invoice.invoiceId}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="locale-label font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {copy.created}
              </span>
              <span className="text-right font-medium text-neutral-950">
                {formatInvoiceTimestamp(invoice.createdAtIso, locale)}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="locale-label font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {copy.checkoutTarget}
              </span>
              <span className="text-right font-semibold text-neutral-950">{targetLabel}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            <span>{copy.items}</span>
            <span>{cartCopy.qtyShort}</span>
          </div>

          <div className="divide-y divide-neutral-200">
            {invoice.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="text-base font-semibold text-neutral-950">
                    {getInvoiceItemTitle(item, locale)}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {item.qty} x {formatCurrency(item.price)}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">{item.id}</p>
                </div>

                <div className="text-right text-sm font-semibold text-neutral-950">
                  {formatCurrency(item.lineTotal)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between text-sm text-neutral-500">
            <span>{copy.subtotal}</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-lg font-bold text-neutral-950">
            <span>{copy.total}</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-[1.25rem] border border-neutral-200 bg-white p-4">
              <QRCode value={qrPayload} size={150} />
            </div>

            <p className="mt-4 text-sm font-semibold text-neutral-950">{copy.scanOrShare}</p>
            <p className="mt-2 text-xs text-neutral-500">
              {invoice.currency} {invoice.total.toFixed(2)}
            </p>
            <p className="mt-3 max-w-[420px] break-all text-xs text-neutral-400">
              {invoice.invoiceId}
            </p>
          </div>
        </div>

        <div className="mt-5 text-xs text-neutral-500">
          {copy.telegram}: {targetLabel}
        </div>
      </div>
    );
  }

  const detailsGridClassName = "mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]";
  const itemHeaderClassName =
    "hidden grid-cols-[minmax(0,1fr)_72px_140px_140px] items-center gap-3 border-b border-neutral-200 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 sm:grid";
  const itemRowClassName =
    "grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_72px_140px_140px] sm:items-center";

  return (
    <div
      id={id}
      className={`rounded-[2rem] border border-neutral-200 bg-white p-5 text-neutral-950 shadow-[0_20px_60px_rgba(15,23,42,0.12)] sm:p-6 ${className ?? ""}`}
    >
      <div className="flex flex-col gap-5 border-b border-neutral-200 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-lime-700">
            {invoice.shop}
          </p>
          <h4 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 md:text-3xl">
            {copy.invoice}
          </h4>
          <p className="mt-1 text-sm text-neutral-500">{copy.orderSummary}</p>
        </div>

        <div className="grid gap-3 text-sm text-neutral-600 md:min-w-[260px] md:text-right">
          <div>
            <p className="locale-label text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              {copy.invoiceId}
            </p>
            <p className="mt-1 font-semibold text-neutral-950">{invoice.invoiceId}</p>
          </div>

          <div>
            <p className="locale-label text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              {copy.created}
            </p>
            <p className="mt-1 font-medium text-neutral-950">
              {formatInvoiceTimestamp(invoice.createdAtIso, locale)}
            </p>
          </div>
        </div>
      </div>

      <div className={detailsGridClassName}>
        <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
          <div className={itemHeaderClassName}>
            <span>{copy.items}</span>
            <span className="text-center">{cartCopy.qtyShort}</span>
            <span className="text-right">{copy.unitPrice}</span>
            <span className="text-right">{copy.lineTotal}</span>
          </div>

          <div className="divide-y divide-neutral-200">
            {invoice.items.map((item) => (
              <div key={item.id} className={itemRowClassName}>
                <div>
                  <p className="text-sm font-semibold text-neutral-950 md:text-base">
                    {getInvoiceItemTitle(item, locale)}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">{item.id}</p>
                </div>

                <div className="flex items-center justify-between text-sm font-medium text-neutral-700 sm:block sm:text-center">
                  <span
                    className="locale-label text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:hidden"
                  >
                    {cartCopy.qtyShort}
                  </span>
                  <span>{item.qty}</span>
                </div>

                <div className="flex items-center justify-between text-sm font-medium text-neutral-700 sm:block sm:text-right">
                  <span
                    className="locale-label text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:hidden"
                  >
                    {copy.unitPrice}
                  </span>
                  <span>{formatCurrency(item.price)}</span>
                </div>

                <div className="flex items-center justify-between text-sm font-semibold text-neutral-950 sm:block sm:text-right">
                  <span
                    className="locale-label text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:hidden"
                  >
                    {copy.lineTotal}
                  </span>
                  <span>{formatCurrency(item.lineTotal)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
            <p className="locale-label text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              {copy.checkoutTarget}
            </p>
            <p className="mt-1 text-base font-semibold text-neutral-950">{targetLabel}</p>
            <p className="mt-2 text-sm text-neutral-500">{copy.telegram}</p>
          </div>

          <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <span>{copy.subtotal}</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-lg font-bold text-neutral-950">
              <span>{copy.total}</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
        <InvoiceQr invoice={invoice} layout="responsive" />
      </div>
    </div>
  );
}

function InvoicePaperPreview({ invoice, locale }: InvoicePaperPreviewProps) {
  const copy = getUiText(locale).invoice;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="locale-label text-xs font-semibold uppercase text-app-primary">
            {copy.imageInvoice}
          </p>
          <p className="mt-1 text-sm text-app-text-muted">
            {copy.imageInvoiceDescription}
          </p>
        </div>

        <div className="rounded-full border border-app-border bg-app-surface-2 px-4 py-2 text-sm font-semibold text-app-text">
          {copy.total}: {formatCurrency(invoice.total)}
        </div>
      </div>

      <InvoicePaperDocument invoice={invoice} locale={locale} />
    </div>
  );
}

function TextInvoicePreview({
  invoice,
  locale,
}: {
  invoice: Invoice;
  locale: Locale;
}) {
  const copy = getUiText(locale).invoice;
  const invoiceText = useMemo(() => formatInvoiceText(invoice, locale), [invoice, locale]);

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="mt-1 rounded-full border border-app-border bg-app-surface-2 p-2 text-app-primary">
          <ScrollText className="size-4" />
        </div>
        <div>
          <p className="locale-label text-xs font-semibold uppercase text-app-primary">
            {copy.textInvoice}
          </p>
          <p className="mt-1 text-sm text-app-text-muted">
            {copy.textInvoiceDescription}
          </p>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-app-border bg-app-surface-2 p-4">
        <pre className="eco-scrollbar max-h-[240px] overflow-auto whitespace-pre-wrap font-mono text-xs leading-6 text-app-text-soft sm:text-[13px]">
          {invoiceText}
        </pre>
      </div>
    </div>
  );
}

function InvoiceCard({
  exportTargetId,
  hasHydrated,
  invoice,
  totalCount,
  clearCart,
  locale,
  reviewOpen,
  onOpenReview,
  onBackToAdjustItems,
  stickyActions = false,
}: InvoiceCardProps) {
  const copy = getUiText(locale).invoice;
  const hasItems = Boolean(invoice && invoice.items.length > 0);

  if (!hasHydrated) {
    return (
      <div className="rounded-[32px] border border-app-border bg-app-surface p-5 shadow-[var(--app-shadow-panel)] backdrop-blur xl:p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded-full bg-app-surface-3" />
              <div className="h-8 w-52 animate-pulse rounded-full bg-app-surface-3" />
              <div className="h-4 w-64 animate-pulse rounded-full bg-app-surface-3" />
            </div>
            <div className="h-16 w-28 animate-pulse rounded-[1rem] bg-app-surface-3" />
          </div>
          <div className="h-80 animate-pulse rounded-[1.75rem] bg-app-surface-2" />
          <div className="h-44 animate-pulse rounded-[1.5rem] bg-app-surface-2" />
          <div className="h-40 animate-pulse rounded-[1.5rem] bg-app-surface-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-app-border bg-app-surface p-5 shadow-[var(--app-shadow-panel)] backdrop-blur xl:p-6">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="locale-label text-xs font-semibold uppercase text-app-primary">
              {reviewOpen ? copy.invoice : copy.checkoutReady}
            </p>
            <h3 className="mt-1 text-2xl font-bold text-app-text xl:text-3xl">
              {reviewOpen ? copy.orderSummary : copy.checkoutReady}
            </h3>
            <p className="mt-1 max-w-xl text-sm text-app-text-muted">
              {reviewOpen ? copy.reviewDescription : copy.checkoutDescription}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[220px]">
            <div className="rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3">
              <div className="locale-label text-[11px] font-medium uppercase text-app-text-faint">
                {copy.items}
              </div>
              <div className="mt-1 text-xl font-bold text-app-text">{totalCount}</div>
            </div>

            <div className="rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3">
              <div className="locale-label text-[11px] font-medium uppercase text-app-text-faint">
                {copy.total}
              </div>
              <div className="mt-1 text-xl font-bold text-app-text">
                {formatCurrency(invoice?.total ?? 0)}
              </div>
            </div>
          </div>
        </div>

        {hasItems && invoice ? (
          <>
            <div className="pointer-events-none fixed left-[-200vw] top-0 z-[-1] opacity-100" aria-hidden="true">
              <InvoicePaperDocument
                id={exportTargetId}
                invoice={invoice}
                locale={locale}
                className="w-[820px]"
                variant="export"
              />
            </div>

            {reviewOpen ? (
              <>
                <button
                  type="button"
                  onClick={onBackToAdjustItems}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-app-text-muted transition hover:text-app-text"
                >
                  <ChevronLeft className="size-4" />
                  {copy.backToAdjustItems}
                </button>

                <InvoicePaperPreview
                  invoice={invoice}
                  locale={locale}
                />
                <TextInvoicePreview invoice={invoice} locale={locale} />
              </>
            ) : (
              <div className="rounded-[1.75rem] border border-app-border bg-app-surface-2 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-app-border bg-app-surface px-4 py-4">
                    <p className="locale-label text-[11px] font-semibold uppercase text-app-text-faint">
                      {copy.invoiceId}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-app-text">
                      {invoice.invoiceId}
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-app-border bg-app-surface px-4 py-4">
                    <p className="locale-label text-[11px] font-semibold uppercase text-app-text-faint">
                      {copy.checkoutTarget}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-app-text">
                      {getTelegramTargetLabel(invoice.telegramUrl)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.25rem] border border-app-border bg-app-surface px-4 py-4">
                  <div className="flex items-center justify-between text-sm text-app-text-muted">
                    <span>{copy.created}</span>
                    <span className="text-right text-app-text">
                      {formatInvoiceTimestamp(invoice.createdAtIso, locale)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-app-border bg-app-bg-soft px-5 py-10 text-center">
            <div className="mx-auto flex max-w-md flex-col items-center">
              <div className="rounded-full border border-app-border bg-app-surface-2 p-3 text-app-primary">
                <ReceiptText className="size-5" />
              </div>
              <p className="mt-4 text-lg font-semibold text-app-text">{copy.emptyTitle}</p>
              <p className="mt-2 text-sm leading-6 text-app-text-muted">
                {copy.emptyDescription}
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        className={
          stickyActions
            ? "sticky bottom-0 mt-5 -mx-5 bg-app-surface px-5 pb-3 pt-3 backdrop-blur xl:-mx-6 xl:px-6"
            : "mt-5"
        }
      >
        {reviewOpen ? (
          <>
            <ShareInvoiceActions
              invoice={invoice}
              disabled={!hasItems}
              exportTargetId={exportTargetId}
            />

            <button
              type="button"
              onClick={clearCart}
              disabled={!hasItems}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-app-danger bg-app-danger-soft px-4 py-3 text-sm font-semibold text-app-danger transition hover:bg-app-surface-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {copy.clearInvoice}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onOpenReview}
            disabled={!hasItems}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-app-primary bg-app-primary px-4 py-3 text-sm font-semibold text-app-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copy.confirmCheckout}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function InvoicePanel() {
  const { locale } = useLocale();
  const copy = getUiText(locale).invoice;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const invoiceMeta = useCartStore((state) => state.invoiceMeta);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const clearCart = useCartStore((state) => state.clearCart);

  const invoice = useMemo(() => buildInvoice(items, invoiceMeta), [items, invoiceMeta]);
  const totalCount = getCartCount(items);
  const mobileTotal = formatCurrency(invoice?.total ?? 0);
  const reviewVisible = reviewOpen && items.length > 0;

  return (
    <>
      <div className="hidden lg:block">
        <InvoiceCard
          exportTargetId="invoice-image-export-desktop"
          hasHydrated={hasHydrated}
          invoice={invoice}
          totalCount={totalCount}
          clearCart={clearCart}
          locale={locale}
          reviewOpen={reviewVisible}
          onOpenReview={() => setReviewOpen(true)}
          onBackToAdjustItems={() => setReviewOpen(false)}
        />
      </div>

      <div className="lg:hidden">
        <div className="hide-on-print fixed inset-x-0 bottom-0 z-40 border-t border-app-border bg-app-bg-soft p-3 backdrop-blur supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-left"
          >
            <div>
              <p className="locale-label text-[11px] font-semibold uppercase text-app-primary">
                {copy.invoice}
              </p>
              <p className="mt-1 text-sm font-semibold text-app-text">
                {hasHydrated
                  ? `${formatItemCount(totalCount, locale)} · ${mobileTotal}`
                  : copy.mobileLoading}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-app-text">
              {copy.open}
              <ChevronUp className="h-4 w-4" />
            </span>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <>
              <motion.div
                className="fixed inset-0 z-50 bg-app-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />

              <motion.div
                className="fixed inset-x-0 bottom-0 z-[60] max-h-[85vh] overflow-auto rounded-t-[32px] border-t border-app-border bg-app-surface p-4 pb-8"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
              >
                <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-app-surface-3" />
                <InvoiceCard
                  exportTargetId="invoice-image-export-mobile"
                  hasHydrated={hasHydrated}
                  invoice={invoice}
                  totalCount={totalCount}
                  clearCart={clearCart}
                  locale={locale}
                  reviewOpen={reviewVisible}
                  onOpenReview={() => setReviewOpen(true)}
                  onBackToAdjustItems={() => setReviewOpen(false)}
                  stickyActions
                />
                {!invoice ? (
                  <a
                    href={TELEGRAM_CHECKOUT_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-app-primary bg-app-primary-soft px-4 py-3 text-sm font-semibold text-app-primary transition hover:bg-app-surface-3"
                  >
                    {copy.openTelegram}
                  </a>
                ) : null}
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}
