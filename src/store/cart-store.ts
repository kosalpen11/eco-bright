"use client";

import { create } from "zustand";
import { buildCartLineId, readCartStorage, writeCartStorage } from "@/lib/cart-storage";
import { createInvoiceMeta } from "@/lib/invoice";
import type { CartItem, CartSnapshot } from "@/types/cart";
import type { OrderSource } from "@/types/order";

interface CartState extends CartSnapshot {
  hasHydrated: boolean;
  isCartOpen: boolean;
  hydrate: () => void;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  setOrderSource: (source: OrderSource) => void;
  openCart: () => void;
  closeCart: () => void;
  refreshInvoiceSession: (nextSource?: OrderSource) => void;
  clearCart: () => void;
  resetInvoice: () => void;
}

function toCartItem(item: Omit<CartItem, "qty">): CartItem {
  return {
    ...item,
    lineId: item.lineId || buildCartLineId(item),
    qty: 1,
  };
}

function persist(snapshot: CartSnapshot) {
  writeCartStorage(snapshot);
}

export const selectCartCount = (state: Pick<CartState, "items">) =>
  state.items.reduce((total, item) => total + item.qty, 0);

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  invoiceMeta: null,
  orderSource: "web",
  hasHydrated: false,
  isCartOpen: false,
  hydrate: () => {
    if (get().hasHydrated) {
      return;
    }

    const snapshot = readCartStorage();

    set({
      items: snapshot.items,
      invoiceMeta:
        snapshot.items.length > 0
          ? snapshot.invoiceMeta ?? createInvoiceMeta()
          : null,
      orderSource: snapshot.orderSource ?? "web",
      hasHydrated: true,
    });
  },
  addItem: (product) =>
    set((state) => {
      const lineId = product.lineId || buildCartLineId(product);
      const nextProduct = { ...product, lineId };
      const current = state.items.find((item) => item.lineId === lineId);
      const nextMeta = state.invoiceMeta ?? createInvoiceMeta();
      const nextItems = current
        ? state.items.map((item) =>
            item.lineId === lineId
              ? {
                  ...item,
                  ...nextProduct,
                  qty: item.qty + 1,
                }
              : item,
          )
        : [...state.items, toCartItem(nextProduct)];

      persist({ items: nextItems, invoiceMeta: nextMeta, orderSource: state.orderSource });

      return {
        items: nextItems,
        invoiceMeta: nextMeta,
        orderSource: state.orderSource,
        isCartOpen: true,
      };
    }),
  removeItem: (lineId) =>
    set((state) => {
      const nextItems = state.items.filter((item) => item.lineId !== lineId);
      const nextMeta = nextItems.length ? state.invoiceMeta ?? createInvoiceMeta() : null;
      persist({ items: nextItems, invoiceMeta: nextMeta, orderSource: state.orderSource });

      return {
        items: nextItems,
        invoiceMeta: nextMeta,
        orderSource: state.orderSource,
      };
    }),
  updateQty: (lineId, qty) =>
    set((state) => {
      const nextItems =
        qty <= 0
          ? state.items.filter((item) => item.lineId !== lineId)
          : state.items.map((item) => (item.lineId === lineId ? { ...item, qty } : item));
      const nextMeta = nextItems.length ? state.invoiceMeta ?? createInvoiceMeta() : null;
      persist({ items: nextItems, invoiceMeta: nextMeta, orderSource: state.orderSource });

      return {
        items: nextItems,
        invoiceMeta: nextMeta,
        orderSource: state.orderSource,
      };
    }),
  setOrderSource: (source) =>
    set((state) => {
      const next = {
        items: state.items,
        invoiceMeta: state.invoiceMeta,
        orderSource: source,
      };
      persist(next);
      return next;
    }),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  refreshInvoiceSession: (nextSource = "web") =>
    set((state) => {
      const next = {
        items: state.items,
        invoiceMeta: state.items.length ? createInvoiceMeta() : null,
        orderSource: nextSource,
      };
      persist(next);
      return next;
    }),
  clearCart: () => {
    const next = { items: [], invoiceMeta: null, orderSource: "web" as const };
    persist(next);
    set(next);
  },
  resetInvoice: () => {
    const next = { items: [], invoiceMeta: null, orderSource: "web" as const };
    persist(next);
    set(next);
  },
}));
