/**
 * Minimal, provider-agnostic click tracking.
 *
 * Events are queued in GA4's `gtag` format on `window.dataLayer`, so they are sent once
 * the GA4 script loads (see AnalyticsScripts; enabled by NEXT_PUBLIC_GA_MEASUREMENT_ID).
 * A `ecobright:analytics` DOM event is also dispatched so other tools can listen in.
 * Tracking must never break the UI, so every step is guarded.
 */

export type AnalyticsEventName = "order_telegram_click" | "add_to_cart";

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_variant?: string | null;
  item_category?: string;
  price: number;
  quantity: number;
}

export interface AnalyticsParams {
  /** Where on the page the click happened, e.g. "buy_box", "sticky_bar", "product_card". */
  location: string;
  currency: string;
  value: number;
  items: AnalyticsItem[];
}

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export function track(event: AnalyticsEventName, params: AnalyticsParams) {
  if (typeof window === "undefined") return;

  try {
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      // Same stub as Google's snippet: queue calls until gtag.js loads.
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
    }
    window.gtag("event", event, params);
    window.dispatchEvent(new CustomEvent("ecobright:analytics", { detail: { event, ...params } }));

    if (process.env.NODE_ENV !== "production") {
      console.debug("[analytics]", event, params);
    }
  } catch {
    // Ignore analytics failures.
  }
}

/** Builds the common payload for a product click. */
export function productEventParams(input: {
  location: string;
  id: string;
  name: string;
  variant?: string | null;
  category?: string;
  price: number;
  quantity: number;
  currency?: string;
}): AnalyticsParams {
  const currency = input.currency || "USD";
  return {
    location: input.location,
    currency,
    value: Math.round(input.price * input.quantity * 100) / 100,
    items: [
      {
        item_id: input.id,
        item_name: input.name,
        item_variant: input.variant ?? null,
        item_category: input.category,
        price: input.price,
        quantity: input.quantity,
      },
    ],
  };
}
