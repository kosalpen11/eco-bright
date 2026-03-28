"use client";

import { create } from "zustand";
import { readCartStorage, writeCartStorage } from "@/lib/cart-storage";
import { createInvoiceMeta } from "@/lib/invoice";
import type { CartItem, CartSnapshot } from "@/types/cart";
import type { Product } from "@/types/product";

interface CartState extends CartSnapshot {
  hasHydrated: boolean;
  hydrate: () => void;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  resetInvoice: () => void;
}

function toCartItem(product: Product): CartItem {
  return {
    id: product.id,
    title: product.title,
    titleKm: product.titleKm,
    categoryLabel: product.categoryLabel,
    categoryLabelKm: product.categoryLabelKm,
    imageUrl: product.imageUrl,
    price: product.price,
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
  hasHydrated: false,
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
      hasHydrated: true,
    });
  },
  addItem: (product) =>
    set((state) => {
      const current = state.items.find((item) => item.id === product.id);
      const nextMeta = state.invoiceMeta ?? createInvoiceMeta();
      const nextItems = current
        ? state.items.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  title: product.title,
                  titleKm: product.titleKm,
                  categoryLabel: product.categoryLabel,
                  categoryLabelKm: product.categoryLabelKm,
                  qty: item.qty + 1,
                }
              : item,
          )
        : [...state.items, toCartItem(product)];

      persist({ items: nextItems, invoiceMeta: nextMeta });

      return {
        items: nextItems,
        invoiceMeta: nextMeta,
      };
    }),
  removeItem: (id) =>
    set((state) => {
      const nextItems = state.items.filter((item) => item.id !== id);
      const nextMeta = nextItems.length ? state.invoiceMeta ?? createInvoiceMeta() : null;
      persist({ items: nextItems, invoiceMeta: nextMeta });

      return {
        items: nextItems,
        invoiceMeta: nextMeta,
      };
    }),
  updateQty: (id, qty) =>
    set((state) => {
      const nextItems =
        qty <= 0
          ? state.items.filter((item) => item.id !== id)
          : state.items.map((item) => (item.id === id ? { ...item, qty } : item));
      const nextMeta = nextItems.length ? state.invoiceMeta ?? createInvoiceMeta() : null;
      persist({ items: nextItems, invoiceMeta: nextMeta });

      return {
        items: nextItems,
        invoiceMeta: nextMeta,
      };
    }),
  clearCart: () => {
    const next = { items: [], invoiceMeta: null };
    persist(next);
    set(next);
  },
  resetInvoice: () => {
    const next = { items: [], invoiceMeta: null };
    persist(next);
    set(next);
  },
}));
