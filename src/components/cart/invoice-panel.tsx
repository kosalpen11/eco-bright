"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, QrCode, ReceiptText, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { InvoiceQr } from "@/components/cart/invoice-qr";
import { ShareInvoiceActions } from "@/components/cart/share-invoice-actions";
import { useLocale } from "@/components/locale/locale-provider";
import { TELEGRAM_CHECKOUT_URL } from "@/lib/constants";
import { formatCurrency } from "@/lib/currency";
import { formatItemCount, getUiText } from "@/lib/i18n";
import { buildInvoice, getCartCount } from "@/lib/invoice";
import { formatInvoiceTimestamp } from "@/lib/invoice-text";
import type { Locale } from "@/lib/locale";
import { useCartStore } from "@/store/cart-store";
import type { CartItem } from "@/types/cart";
import type { Invoice } from "@/types/invoice";

interface InvoiceCardProps {
  exportTargetId: string;
  hasHydrated: boolean;
  invoice: Invoice | null;
  items: CartItem[];
  totalCount: number;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  locale: Locale;
  stickyActions?: boolean;
}

function InvoiceCard({
  exportTargetId,
  hasHydrated,
  invoice,
  items,
  totalCount,
  updateQty,
  removeItem,
  clearCart,
  locale,
  stickyActions = false,
}: InvoiceCardProps) {
  const copy = getUiText(locale).invoice;
  const hasItems = items.length > 0;

  if (!hasHydrated) {
    return (
      <div className="rounded-[28px] border border-app-border bg-app-surface p-5 shadow-[var(--app-shadow-panel)] backdrop-blur xl:p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded-full bg-app-surface-3" />
              <div className="h-8 w-52 animate-pulse rounded-full bg-app-surface-3" />
              <div className="h-4 w-64 animate-pulse rounded-full bg-app-surface-3" />
            </div>
            <div className="h-16 w-20 animate-pulse rounded-[1rem] bg-app-surface-3" />
          </div>
          <div className="h-24 animate-pulse rounded-[1.25rem] bg-app-surface-2" />
          <div className="h-72 animate-pulse rounded-[1.5rem] bg-app-surface-2" />
          <div className="h-28 animate-pulse rounded-[1.5rem] bg-app-surface-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-app-border bg-app-surface p-5 shadow-[var(--app-shadow-panel)] backdrop-blur xl:p-6">
      <div id={exportTargetId} className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="locale-label text-xs font-semibold uppercase text-app-primary">
              {copy.invoice}
            </p>
            <h3 className="mt-1 text-2xl font-bold text-app-text xl:text-3xl">
              {copy.orderSummary}
            </h3>
            <p className="mt-1 text-sm text-app-text-muted">
              {copy.reviewDescription}
            </p>
          </div>

          <div className="rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-right">
            <div className="locale-label text-[11px] font-medium uppercase text-app-text-faint">
              {copy.items}
            </div>
            <div className="mt-1 text-2xl font-bold text-app-text">{totalCount}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface-2 p-4">
          <div className="flex items-center justify-between gap-3 text-sm text-app-text-soft">
            <span className="inline-flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-app-primary" />
              {copy.invoiceId}
            </span>
            <span className="locale-nowrap text-right font-medium text-app-text">
              {invoice?.invoiceId ?? copy.pending}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-sm text-app-text-soft">
            <span className="inline-flex items-center gap-2">
              <QrCode className="h-4 w-4 text-app-primary" />
              {copy.created}
            </span>
            <span className="text-right font-medium text-app-text">
              {invoice
                ? formatInvoiceTimestamp(invoice.createdAtIso, locale)
                : copy.addItemsToGenerate}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="locale-label flex items-center justify-between text-xs font-semibold uppercase text-app-text-faint">
            <span>{copy.items}</span>
            <span>{invoice?.currency ?? "USD"}</span>
          </div>

          {hasItems ? (
            <motion.ul
              layout
              className="eco-scrollbar max-h-[320px] space-y-3 overflow-auto pr-1 xl:max-h-[360px]"
            >
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <CartItemRow
                      item={item}
                      onIncrease={() => updateQty(item.id, item.qty + 1)}
                      onDecrease={() => updateQty(item.id, item.qty - 1)}
                      onRemove={() => removeItem(item.id)}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-app-border bg-app-bg-soft px-4 py-7 text-center">
              <p className="text-sm font-medium text-app-text">{copy.emptyTitle}</p>
              <p className="mt-1 text-sm text-app-text-muted">
                {copy.emptyDescription}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface-2 p-4">
          <div className="flex items-center justify-between text-sm text-app-text-soft">
            <span>{copy.subtotal}</span>
            <span>{formatCurrency(invoice?.subtotal ?? 0)}</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-lg font-bold text-app-text xl:text-xl">
            <span>{copy.total}</span>
            <span>{formatCurrency(invoice?.total ?? 0)}</span>
          </div>
        </div>

        {hasItems && invoice ? (
          <div className="rounded-2xl border border-app-qr-border bg-app-qr p-4 text-app-qr-text">
            <InvoiceQr invoice={invoice} />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-app-border bg-app-bg-soft p-4 text-sm text-app-text-muted">
            {copy.qrHint}
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
      </div>
    </div>
  );
}

export function InvoicePanel() {
  const { locale } = useLocale();
  const copy = getUiText(locale).invoice;
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const invoiceMeta = useCartStore((state) => state.invoiceMeta);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const invoice = useMemo(() => buildInvoice(items, invoiceMeta), [items, invoiceMeta]);
  const totalCount = getCartCount(items);
  const mobileTotal = formatCurrency(invoice?.total ?? 0);

  return (
    <>
      <div className="hidden lg:block">
        <InvoiceCard
          exportTargetId="invoice-image-export-desktop"
          hasHydrated={hasHydrated}
          invoice={invoice}
          items={items}
          totalCount={totalCount}
          updateQty={updateQty}
          removeItem={removeItem}
          clearCart={clearCart}
          locale={locale}
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
                  items={items}
                  totalCount={totalCount}
                  updateQty={updateQty}
                  removeItem={removeItem}
                  clearCart={clearCart}
                  locale={locale}
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
