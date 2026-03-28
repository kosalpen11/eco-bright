export interface CartItem {
  id: string;
  title: string;
  titleKm?: string;
  categoryLabel: string;
  categoryLabelKm?: string;
  imageUrl: string;
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
}
