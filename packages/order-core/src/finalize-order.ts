import { eq } from "drizzle-orm";
import { getDb, ordersTable, orderStatusHistoryTable } from "../../db/src";
import { assertOrderStatusTransition } from "./order-status-machine";
import type { FinalizeOrderInput } from "./types";
import type { OrderStatus } from "../../../src/types/order";

export async function finalizeOrder(input: FinalizeOrderInput) {
  const db = getDb();
  const [existingOrder] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, input.orderId))
    .limit(1);

  if (!existingOrder) {
    throw new Error(`Draft order not found: ${input.orderId}`);
  }

  const nextStatus = (input.status ?? "pending") as OrderStatus;

  if ((existingOrder.status as OrderStatus) === nextStatus) {
    return existingOrder;
  }

  assertOrderStatusTransition(existingOrder.status as OrderStatus, nextStatus);

  const [order] = await db.transaction(async (tx) => {
    const [updatedOrder] = await tx
      .update(ordersTable)
      .set({
        status: nextStatus,
        customerName: input.customerName ?? existingOrder.customerName,
        customerPhone: input.customerPhone ?? existingOrder.customerPhone,
        note: input.note ?? existingOrder.note,
        telegramUserId: input.telegramCustomerUserId ?? existingOrder.telegramUserId,
        telegramUsername: input.telegramCustomerUsername ?? existingOrder.telegramUsername,
        telegramUrl: input.telegramUrl ?? existingOrder.telegramUrl,
        telegramMessage: input.telegramMessage ?? existingOrder.telegramMessage,
        telegramCustomerUserId:
          input.telegramCustomerUserId ?? existingOrder.telegramCustomerUserId,
        telegramCustomerUsername:
          input.telegramCustomerUsername ?? existingOrder.telegramCustomerUsername,
        telegramCustomerChatId:
          input.telegramCustomerChatId ?? existingOrder.telegramCustomerChatId,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, input.orderId))
      .returning();

    await tx.insert(orderStatusHistoryTable).values({
      orderId: updatedOrder.id,
      fromStatus: existingOrder.status,
      toStatus: nextStatus,
      action: "finalize_order",
      actorType: "customer",
      actorId: input.telegramCustomerUserId ?? existingOrder.telegramCustomerUserId ?? null,
      actorName:
        input.telegramCustomerUsername ??
        existingOrder.telegramCustomerUsername ??
        input.customerName ??
        existingOrder.customerName ??
        null,
      reason: null,
    });

    return [updatedOrder];
  });

  return order;
}
