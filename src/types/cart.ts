import type { OrderSource } from "@/types/order";
import type { ProductCategory } from "@/types/product";

export interface CartItem {
  id: string;
  title: string;
  titleKm?: string;
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
