import { STORAGE_KEYS } from "@/lib/constants";
import type { CartItem, CartSnapshot, InvoiceMeta } from "@/types/cart";
import { ORDER_SOURCES, type OrderSource } from "@/types/order";

const emptySnapshot: CartSnapshot = {
  items: [],
  invoiceMeta: null,
  orderSource: "web",
};

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.category === "string" &&
    typeof candidate.categoryLabel === "string" &&
    (typeof candidate.imageUrl === "string" || candidate.imageUrl === null) &&
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

function isOrderSource(value: unknown): value is OrderSource {
  return typeof value === "string" && ORDER_SOURCES.includes(value as OrderSource);
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
      orderSource: isOrderSource(parsed.orderSource) ? parsed.orderSource : "web",
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

export interface CheckoutFormState {
  customerPhone: string;
  customerName: string;
  note: string;
  fulfillmentMethod: "pickup" | "delivery" | "";
}

const emptyCheckoutForm: CheckoutFormState = {
  customerPhone: "",
  customerName: "",
  note: "",
  fulfillmentMethod: "",
};

function isCheckoutFormState(value: unknown): value is CheckoutFormState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.customerPhone === "string" &&
    typeof candidate.customerName === "string" &&
    typeof candidate.note === "string" &&
    (candidate.fulfillmentMethod === "pickup" ||
      candidate.fulfillmentMethod === "delivery" ||
      candidate.fulfillmentMethod === "")
  );
}

export function readCheckoutFormStorage(): CheckoutFormState {
  if (typeof window === "undefined") {
    return emptyCheckoutForm;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.checkoutForm);

    if (!raw) {
      return emptyCheckoutForm;
    }

    const parsed = JSON.parse(raw) as Partial<CheckoutFormState>;

    return isCheckoutFormState(parsed) ? parsed : emptyCheckoutForm;
  } catch {
    return emptyCheckoutForm;
  }
}

export function writeCheckoutFormStorage(formState: CheckoutFormState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEYS.checkoutForm, JSON.stringify(formState));
  } catch {
    // Ignore storage quota or privacy mode errors to keep the UI usable.
  }
}

export function clearCheckoutFormStorage() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEYS.checkoutForm);
  } catch {
    // Ignore errors.
  }
}
