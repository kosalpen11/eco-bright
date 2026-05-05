import { createInvoiceMeta } from "../../../src/lib/invoice/build-invoice";
import { generateOrderCode } from "../../../src/db/generate-order-code";
import {
  deriveItemLineTotal,
  deriveOrderItemCount,
  deriveOrderSubtotal,
} from "../../../src/lib/validation/order";
import { getDb, orderItemsTable, ordersTable, orderStatusHistoryTable } from "../../db/src";
import type { CreateDraftOrderInput } from "./types";

export async function createDraftOrder(input: CreateDraftOrderInput) {
  const db = getDb();
  const invoiceMeta = createInvoiceMeta();
  const itemCount = deriveOrderItemCount(input.items);
  const subtotal = deriveOrderSubtotal(input.items);
  const orderCode = input.orderCode ?? (await generateOrderCode());

  return db.transaction(async (tx) => {
    const [order] = await tx
      .insert(ordersTable)
      .values({
        invoiceId: invoiceMeta.invoiceId,
        orderCode,
        shop: input.shop,
        currency: input.currency,
        itemCount,
        subtotal,
        total: subtotal,
        customerName: input.customerName ?? null,
        customerPhone: input.customerPhone ?? null,
        note: input.note ?? null,
        telegramUserId: input.telegramCustomerUserId ?? null,
        telegramUsername: input.telegramCustomerUsername ?? null,
        telegramUrl: input.telegramUrl ?? null,
        telegramMessage: input.telegramMessage ?? null,
        telegramCustomerUserId: input.telegramCustomerUserId ?? null,
        telegramCustomerUsername: input.telegramCustomerUsername ?? null,
        telegramCustomerChatId: input.telegramCustomerChatId ?? null,
        status: "draft",
        source: input.source,
        updatedAt: new Date(),
      })
      .returning();

    if (input.items.length) {
      await tx.insert(orderItemsTable).values(
        input.items.map((item) => ({
          orderId: order.id,
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

    await tx.insert(orderStatusHistoryTable).values({
      orderId: order.id,
      fromStatus: null,
      toStatus: "draft",
      action: "create_draft",
      actorType: "customer",
      actorId: input.telegramCustomerUserId ?? null,
      actorName: input.telegramCustomerUsername ?? input.customerName ?? null,
      reason: null,
    });

    return order;
  });
}
