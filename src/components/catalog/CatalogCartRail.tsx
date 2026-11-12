"use client";

import { InvoicePanel } from "@/components/cart/invoice-panel";

export function CatalogCartRail() {
  return (
    <aside id="cart-rail" className="scroll-mt-28 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto">
      <InvoicePanel />
    </aside>
  );
}
