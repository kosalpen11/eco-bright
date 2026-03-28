import { STORAGE_KEYS } from "@/lib/constants";
import type { CartItem, CartSnapshot, InvoiceMeta } from "@/types/cart";

const emptySnapshot: CartSnapshot = {
  items: [],
  invoiceMeta: null,
};

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.slug === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.categoryLabel === "string" &&
    typeof candidate.imageUrl === "string" &&
    typeof candidate.price === "number" &&
    typeof candidate.qty === "number"
  );
}

function isInvoiceMeta(value: unknown): value is InvoiceMeta {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.invoiceId === "string" &&
    typeof candidate.createdAtIso === "string"
  );
}

export function readCartStorage(): CartSnapshot {
  if (typeof window === "undefined") {
    return emptySnapshot;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.cart);

    if (!raw) {
      return emptySnapshot;
    }

    const parsed = JSON.parse(raw) as Partial<CartSnapshot>;

    return {
      items: Array.isArray(parsed.items) ? parsed.items.filter(isCartItem) : [],
      invoiceMeta: isInvoiceMeta(parsed.invoiceMeta) ? parsed.invoiceMeta : null,
    };
  } catch {
    return emptySnapshot;
  }
}

export function writeCartStorage(snapshot: CartSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(snapshot));
  } catch {
    // Ignore storage quota or privacy mode errors to keep the UI usable.
  }
}
