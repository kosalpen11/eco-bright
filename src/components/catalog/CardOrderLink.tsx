"use client";

import type { ReactNode } from "react";

import { productEventParams, track } from "@/lib/analytics";

/** Card-level "Order via Telegram" link; records the click before Telegram opens. */
export function CardOrderLink({
  href,
  className,
  children,
  product,
  location = "product_card",
}: {
  href: string;
  className?: string;
  children: ReactNode;
  product: { id: string; name: string; category: string; price: number; currency: string };
  /** Analytics location, e.g. "product_card" or "recommended_row". */
  location?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={() =>
        track(
          "order_telegram_click",
          productEventParams({
            location,
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            quantity: 1,
            currency: product.currency,
          }),
        )
      }
    >
      {children}
    </a>
  );
}
