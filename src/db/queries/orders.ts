import { z } from "zod";
import { getDb } from "@/db/client";
import { orderItemsTable, ordersTable } from "@/db/schema";

export const orderInvoiceItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  titleKm: z.string().min(1).optional(),
  price: z.number().nonnegative(),
  qty: z.int().positive(),
  lineTotal: z.number().nonnegative(),
});

export const orderInvoiceSchema = z.object({
  invoiceId: z.string().min(1),
  shop: z.string().min(1),
  currency: z.literal("USD"),
  createdAtIso: z.string().datetime(),
  items: z.array(orderInvoiceItemSchema).min(1),
  subtotal: z.number().nonnegative(),
  total: z.number().nonnegative(),
  telegramUrl: z.string().url(),
});

export const createOrderInputSchema = z.object({
  invoice: orderInvoiceSchema,
  customerName: z.string().trim().min(1).optional(),
  customerPhone: z.string().trim().min(1).optional(),
  note: z.string().trim().min(1).optional(),
});

export type CreateOrderWithItemsInput = z.infer<typeof createOrderInputSchema>;

export async function createOrderWithItems(input: CreateOrderWithItemsInput) {
  const db = getDb();

  return db.transaction(async (tx) => {
    const itemCount = input.invoice.items.reduce((sum, item) => sum + item.qty, 0);

    const [order] = await tx
      .insert(ordersTable)
      .values({
        invoiceId: input.invoice.invoiceId,
        shop: input.invoice.shop,
        currency: input.invoice.currency,
        itemCount,
        subtotal: input.invoice.subtotal,
        total: input.invoice.total,
        customerName: input.customerName ?? null,
        customerPhone: input.customerPhone ?? null,
        note: input.note ?? null,
        telegramUrl: input.invoice.telegramUrl,
      })
      .returning({
        id: ordersTable.id,
        invoiceId: ordersTable.invoiceId,
      });

    await tx.insert(orderItemsTable).values(
      input.invoice.items.map((item) => ({
        orderId: order.id,
        productId: item.id,
        title: item.title,
        price: item.price,
        qty: item.qty,
        lineTotal: item.lineTotal,
      })),
    );

    return order;
  });
}
