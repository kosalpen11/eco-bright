export type CurrencyCode = "USD";

export interface InvoiceItemInput {
  id: string;
  title: string;
  titleKm?: string;
  price: number;
  qty: number;
}

export type InvoicePayloadItem = InvoiceItemInput;

export interface InvoicePayload {
  invoiceId: string;
  shop: string;
  currency: CurrencyCode;
  createdAtIso: string;
  items: InvoicePayloadItem[];
  subtotal: number;
  total: number;
  telegram: string;
}

export interface InvoiceItem extends InvoiceItemInput {
  lineTotal: number;
}

export interface Invoice {
  invoiceId: string;
  shop: string;
  currency: CurrencyCode;
  createdAtIso: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  telegramUrl: string;
  payload: InvoicePayload;
}
