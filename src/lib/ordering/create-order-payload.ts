import type { Invoice } from "@/types/invoice";
import type { CreateOrderInput, FulfillmentMethod, TelegramOrderPayload } from "@/types/order";

export function createOrderPayload(input: {
  invoice: Invoice;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  fulfillmentMethod?: FulfillmentMethod | "";
  source?: CreateOrderInput["source"];
}): CreateOrderInput {
  // Filter out empty string and undefined, return valid FulfillmentMethod or undefined
  const isValidFulfillmentMethod = (value: unknown): value is FulfillmentMethod => 
    value === "pickup" || value === "delivery";
  
  return {
    invoice: input.invoice,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    note: input.note,
    fulfillmentMethod: isValidFulfillmentMethod(input.fulfillmentMethod) ? input.fulfillmentMethod : undefined,
    source: input.source ?? "web",
  };
}

export function createTelegramOrderPayload(
  input: CreateOrderInput,
  orderId?: string,
): TelegramOrderPayload {
  return {
    orderId,
    invoiceId: input.invoice.invoiceId,
    shop: input.invoice.shop,
    currency: input.invoice.currency,
    items: input.invoice.items.map((item) => ({
      productId: item.id,
      title: item.title,
      price: item.price,
      qty: item.qty,
      lineTotal: item.lineTotal,
      imageUrl: item.imageUrl ?? null,
      category: item.category ?? null,
    })),
    subtotal: input.invoice.subtotal,
    total: input.invoice.total,
    customerName: input.customerName ?? null,
    customerPhone: input.customerPhone ?? null,
    note: input.note ?? null,
    fulfillmentMethod: input.fulfillmentMethod ?? null,
  };
}
