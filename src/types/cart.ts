import type { OrderSource } from "@/types/order";
import type { ProductCategory } from "@/types/product";

export interface CartItem {
  lineId: string;
  id: string;
  productId: string;
  variantId?: string | null;
  title: string;
  titleKm?: string;
  variantTitle?: string | null;
  // optional user-selected option label (e.g. "Red / Large")
  optionLabel?: string | null;
  // optional price for the selected option/variant (overrides `price` when present)
  optionPrice?: number | null;
  category: ProductCategory;
  categoryLabel: string;
  categoryLabelKm?: string;
  imageUrl: string | null;
  price: number;
  qty: number;
}

export interface InvoiceMeta {
  invoiceId: string;
  createdAtIso: string;
}

export interface CartSnapshot {
  items: CartItem[];
  invoiceMeta: InvoiceMeta | null;
  orderSource: OrderSource;
}
