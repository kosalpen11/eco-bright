"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { selectCartCount, useCartStore } from "@/store/cart-store";

interface CartBadgeProps {
  className?: string;
  showLabel?: boolean;
}

export function CartBadge({ className, showLabel = true }: CartBadgeProps) {
  const count = useCartStore(selectCartCount);
  const { locale } = useLocale();
  const copy = getUiText(locale).cart;

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full border border-app-border bg-app-surface-2 px-3 py-2 text-sm font-semibold text-app-text-soft",
        className,
      )}
    >
      <ShoppingCart className="size-4 text-app-primary" />
      {showLabel ? <span className="hidden sm:inline">{copy.cart}</span> : null}
      <span className="sr-only">{copy.itemsInCart(count)}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={count}
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.75, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="grid min-w-6 place-items-center rounded-full bg-app-primary px-1.5 py-1 text-[0.7rem] font-bold text-app-qr-text"
          aria-hidden="true"
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
