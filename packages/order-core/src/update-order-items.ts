import { eq } from "drizzle-orm";
import {
  deriveItemLineTotal,
  deriveOrderItemCount,
  deriveOrderSubtotal,
} from "../../../src/lib/validation/order";
import { getDb, orderItemsTable, ordersTable } from "../../db/src";
import type { UpdateDraftOrderItemsInput } from "./types";

export async function updateDraftOrderItems(input: UpdateDraftOrderItemsInput) {
  const db = getDb();
  const itemCount = deriveOrderItemCount(input.items);
  const subtotal = deriveOrderSubtotal(input.items);

  return db.transaction(async (tx) => {
    await tx.delete(orderItemsTable).where(eq(orderItemsTable.orderId, input.orderId));

    if (input.items.length) {
      await tx.insert(orderItemsTable).values(
        input.items.map((item) => ({
          orderId: input.orderId,
          productId: item.productId,
          title: item.title,
          price: item.price,
          qty: item.qty,
          lineTotal: deriveItemLineTotal(item),
          imageUrl: item.imageUrl ?? null,
          category: item.category ?? null,
        })),
      );
    }

    const [order] = await tx
      .update(ordersTable)
      .set({
        orderCode: input.orderCode ?? undefined,
        itemCount,
        subtotal,
        total: subtotal,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        note: input.note,
        telegramUserId: input.telegramCustomerUserId ?? null,
        telegramUsername: input.telegramCustomerUsername ?? null,
        telegramCustomerUserId: input.telegramCustomerUserId ?? null,
        telegramCustomerUsername: input.telegramCustomerUsername ?? null,
        telegramCustomerChatId: input.telegramCustomerChatId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, input.orderId))
      .returning();

    return order;
  });
}
