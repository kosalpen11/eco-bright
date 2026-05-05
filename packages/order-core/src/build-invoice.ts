import { eq } from "drizzle-orm";
import { getDb, orderItemsTable, ordersTable } from "../../db/src";
import type { OrderInvoiceSummary } from "./types";

export async function buildOrderInvoice(orderId: string): Promise<OrderInvoiceSummary | null> {
  const db = getDb();
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!order) {
    return null;
  }

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  return {
    orderId: order.id,
    invoiceId: order.invoiceId,
    shop: order.shop,
    currency: order.currency as OrderInvoiceSummary["currency"],
    subtotal: order.subtotal,
    total: order.total,
    itemCount: order.itemCount,
    status: order.status as OrderInvoiceSummary["status"],
    items: items.map((item) => ({
      productId: item.productId,
      title: item.title,
      qty: item.qty,
      price: item.price,
      lineTotal: item.lineTotal,
    })),
  };
}
