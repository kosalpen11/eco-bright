"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocale } from "@/components/locale/locale-provider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/currency";
import { formatItemCount, getInvoiceItemTitle, getUiText } from "@/lib/i18n";
import { getCartCount } from "@/lib/invoice";
import { useCartStore } from "@/store/cart-store";

function CompactCartRows() {
  const { locale } = useLocale();
  const cartCopy = getUiText(locale).cart;
  const productCopy = getUiText(locale).product;
  const invoiceCopy = getUiText(locale).invoice;
  const items = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <motion.ul
      layout
      className="eco-scrollbar max-h-[280px] space-y-2 overflow-auto pr-1"
    >
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const title = getInvoiceItemTitle(item, locale);

          return (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <div className="rounded-[1.1rem] border border-app-border bg-app-surface px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-app-text">{title}</p>
                    <p className="mt-1 text-xs text-app-text-muted">
                      {formatCurrency(item.price)} {productCopy.each}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-app-text">
                      {formatCurrency(item.price * item.qty)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-app-border bg-app-bg-soft px-2 py-1">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      aria-label={cartCopy.decreaseQuantity(title)}
                      className="inline-flex size-7 items-center justify-center rounded-full text-app-text-muted transition hover:bg-app-surface-2 hover:text-app-text"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-5 text-center text-sm font-semibold text-app-text">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      aria-label={cartCopy.increaseQuantity(title)}
                      className="inline-flex size-7 items-center justify-center rounded-full text-app-text-muted transition hover:bg-app-surface-2 hover:text-app-text"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={cartCopy.removeFromCart(title)}
                    className="text-xs font-semibold text-app-text-muted transition hover:text-app-danger"
                  >
                    {invoiceCopy.removeItem}
                  </button>
                </div>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </motion.ul>
  );
}

function CartAdjustSummary({
  itemCount,
  total,
}: {
  itemCount: number;
  total: number;
}) {
  const { locale } = useLocale();
  const copy = getUiText(locale).invoice;

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl border border-app-border bg-app-surface text-app-primary">
        <ShoppingCart className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="locale-label text-[11px] font-semibold uppercase text-app-primary">
          {copy.adjustItems}
        </p>
        <p className="mt-1 text-sm font-semibold text-app-text">
          {formatItemCount(itemCount, locale)} · {formatCurrency(total)}
        </p>
      </div>
    </div>
  );
}

export function CartAdjustPanel() {
  const { locale } = useLocale();
  const copy = getUiText(locale).invoice;
  const items = useCartStore((state) => state.items);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const itemCount = getCartCount(items);
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <div className="pointer-events-none fixed bottom-6 left-4 z-30 hidden lg:block sm:left-6">
        <div className="pointer-events-auto">
          <AnimatePresence mode="wait" initial={false}>
            {desktopOpen ? (
              <motion.section
                key="desktop-cart-panel"
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.96 }}
                className="w-[min(22rem,calc(100vw-2rem))] rounded-[30px] border border-app-border bg-app-surface/95 p-4 shadow-[var(--app-shadow-panel)] backdrop-blur-2xl"
                aria-labelledby="floating-adjust-items-title"
              >
                <div className="flex items-start justify-between gap-3">
                  <CartAdjustSummary itemCount={itemCount} total={total} />
                  <button
                    type="button"
                    onClick={() => setDesktopOpen(false)}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-app-border bg-app-surface-2 text-app-text-muted transition hover:text-app-text"
                    aria-label="Close adjust items panel"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <p
                  id="floating-adjust-items-title"
                  className="mt-3 text-sm leading-6 text-app-text-muted"
                >
                  {copy.adjustItemsDescription}
                </p>

                <div className="mt-4 border-t border-app-border pt-4">
                  <CompactCartRows />
                </div>
              </motion.section>
            ) : (
              <motion.button
                key="desktop-cart-trigger"
                type="button"
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.96 }}
                onClick={() => setDesktopOpen(true)}
                className="flex w-[min(20rem,calc(100vw-2rem))] items-center justify-between gap-4 rounded-full border border-app-border bg-app-surface/95 px-4 py-3 shadow-[var(--app-shadow-card)] backdrop-blur-2xl"
              >
                <CartAdjustSummary itemCount={itemCount} total={total} />
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-app-text">
                  {copy.open}
                  <ChevronUp className="size-4" />
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="fixed bottom-24 right-4 z-30 flex items-center gap-3 rounded-full border border-app-border bg-app-surface/95 px-4 py-3 shadow-[var(--app-shadow-card)] backdrop-blur-2xl"
            >
              <CartAdjustSummary itemCount={itemCount} total={total} />
            </button>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="max-h-[68vh] rounded-t-[2rem] pb-6"
          >
            <SheetHeader className="pr-10">
              <SheetTitle className="text-2xl normal-case tracking-normal">
                {copy.adjustItems}
              </SheetTitle>
              <SheetDescription>{copy.adjustItemsDescription}</SheetDescription>
            </SheetHeader>

            <div className="rounded-[1.25rem] border border-app-border bg-app-surface px-4 py-4">
              <div className="flex items-center justify-between text-sm text-app-text-muted">
                <span>{formatItemCount(itemCount, locale)}</span>
                <span className="font-semibold text-app-text">{formatCurrency(total)}</span>
              </div>
            </div>

            <CompactCartRows />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
