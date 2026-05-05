import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  orderItemsTable,
  ordersTable,
  orderStatusHistoryTable,
} from "@/db/schema";
import { generateOrderId } from "@/db/generate-order-id";
import { generateOrderCode } from "@/db/generate-order-code";
import {
  isHumanOrderCode,
  isLegacyShortOrderId,
  normalizeOrderLookupInput,
} from "@/lib/ordering/order-lookup";
import {
  createOrderRequestSchema,
  deriveItemLineTotal,
  deriveOrderItemCount,
  deriveOrderSubtotal,
  orderStatusSchema,
  type ValidatedCreateOrderInput,
} from "@/lib/validation/order";
import type {
  OrderItemRecord,
  OrderRecord,
  OrderStatus,
  OrderStatusActorType,
  OrderStatusHistoryRecord,
  OrderWithItemsRecord,
  PersistedOrderSummary,
} from "@/types/order";

interface CreateOrderWithItemsPersistenceInput extends ValidatedCreateOrderInput {
  telegramUrl: string;
  telegramMessage: string;
  shortOrderId?: string;
  orderCode?: string;
}

export interface ApplyOrderStatusUpdateInput {
  orderId: string;
  nextStatus: OrderStatus;
  action: string;
  actorType: OrderStatusActorType;
  actorId?: string | null;
  actorName?: string | null;
  reason?: string | null;
  adminNote?: string | null;
  rejectionReason?: string | null;
}

const OPEN_ADMIN_ORDER_STATUSES = [
  "pending",
  "accepted",
  "needs_clarification",
  "processing",
] as const satisfies OrderStatus[];

function mapOrderRowToRecord(row: typeof ordersTable.$inferSelect): OrderRecord {
  return {
    id: row.id,
    invoiceId: row.invoiceId,
    shortOrderId: row.shortOrderId,
    orderCode: row.orderCode,
    shop: row.shop,
    currency: row.currency as OrderRecord["currency"],
    itemCount: row.itemCount,
    subtotal: row.subtotal,
    total: row.total,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    note: row.note,
    fulfillmentMethod: row.fulfillmentMethod as OrderRecord["fulfillmentMethod"],
    telegramUserId: row.telegramUserId,
    telegramUsername: row.telegramUsername,
    telegramUrl: row.telegramUrl,
    telegramMessage: row.telegramMessage,
    telegramCustomerUserId: row.telegramCustomerUserId,
    telegramCustomerUsername: row.telegramCustomerUsername,
    telegramCustomerChatId: row.telegramCustomerChatId,
    status: row.status as OrderRecord["status"],
    source: row.source as OrderRecord["source"],
    adminNote: row.adminNote,
    rejectionReason: row.rejectionReason,
    acceptedAt: row.acceptedAt,
    rejectedAt: row.rejectedAt,
    processedAt: row.processedAt,
    completedAt: row.completedAt,
    cancelledAt: row.cancelledAt,
    reviewedByTelegramUserId: row.reviewedByTelegramUserId,
    reviewedByName: row.reviewedByName,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapOrderItemRowToRecord(row: typeof orderItemsTable.$inferSelect): OrderItemRecord {
  return {
    id: row.id,
    orderId: row.orderId,
    productId: row.productId,
    title: row.title,
    price: row.price,
    qty: row.qty,
    lineTotal: row.lineTotal,
    imageUrl: row.imageUrl ?? null,
    category: row.category ?? null,
    createdAt: row.createdAt,
  };
}

function mapHistoryRowToRecord(
  row: typeof orderStatusHistoryTable.$inferSelect,
): OrderStatusHistoryRecord {
  return {
    id: row.id,
    orderId: row.orderId,
    fromStatus: row.fromStatus as OrderStatus | null,
    toStatus: row.toStatus as OrderStatus,
    action: row.action,
    reason: row.reason,
    actorType: row.actorType as OrderStatusActorType,
    actorId: row.actorId,
    actorName: row.actorName,
    createdAt: row.createdAt,
  };
}

function buildOrderStatusTimestampPatch(nextStatus: OrderStatus) {
  const now = new Date();

  switch (nextStatus) {
    case "accepted":
      return { acceptedAt: now };
    case "rejected":
      return { rejectedAt: now };
    case "processing":
      return { processedAt: now };
    case "completed":
      return { completedAt: now };
    case "cancelled":
      return { cancelledAt: now };
    default:
      return {};
  }
}

export { createOrderRequestSchema as createOrderInputSchema };
export type { ValidatedCreateOrderInput as CreateOrderWithItemsInput };

export async function createOrderWithItems(input: CreateOrderWithItemsPersistenceInput) {
  const db = getDb();
  const itemCount = deriveOrderItemCount(input.invoice.items);
  const subtotal = deriveOrderSubtotal(input.invoice.items);
  const total = subtotal;
  
  // Use provided shortOrderId or generate a new one
  const shortOrderId = input.shortOrderId ?? (await generateOrderId());
  const orderCode = input.orderCode ?? (await generateOrderCode());

  return db.transaction(async (tx) => {
    const [order] = await tx
      .insert(ordersTable)
      .values({
        invoiceId: input.invoice.invoiceId,
        shortOrderId,
        orderCode,
        shop: input.invoice.shop,
        currency: input.invoice.currency,
        itemCount,
        subtotal,
        total,
        customerName: input.customerName ?? null,
        customerPhone: input.customerPhone ?? null,
        note: input.note ?? null,
        fulfillmentMethod: input.fulfillmentMethod ?? null,
        telegramUserId: null,
        telegramUsername: null,
        telegramUrl: input.telegramUrl,
        telegramMessage: input.telegramMessage,
        status: "pending",
        source: input.source,
        updatedAt: new Date(),
      })
      .returning({
        id: ordersTable.id,
        invoiceId: ordersTable.invoiceId,
        shortOrderId: ordersTable.shortOrderId,
        orderCode: ordersTable.orderCode,
        status: ordersTable.status,
        telegramUrl: ordersTable.telegramUrl,
        telegramMessage: ordersTable.telegramMessage,
        source: ordersTable.source,
        fulfillmentMethod: ordersTable.fulfillmentMethod,
        customerName: ordersTable.customerName,
        customerPhone: ordersTable.customerPhone,
      });

    await tx.insert(orderItemsTable).values(
      input.invoice.items.map((item) => ({
        orderId: order.id,
        productId: item.id,
        title: item.title,
        price: item.price,
        qty: item.qty,
        lineTotal: deriveItemLineTotal(item),
        imageUrl: item.imageUrl ?? null,
        category: item.category ?? null,
      })),
    );

    await tx.insert(orderStatusHistoryTable).values({
      orderId: order.id,
      fromStatus: null,
      toStatus: "pending",
      action: "create_order",
      actorType: "customer",
      reason: null,
      actorId: null,
      actorName: input.customerName ?? null,
    });

    return {
      orderId: order.id,
      shortOrderId: order.shortOrderId!,
      orderCode: order.orderCode,
      invoiceId: order.invoiceId,
      status: order.status as PersistedOrderSummary["status"],
      telegramUrl: order.telegramUrl ?? input.telegramUrl,
      telegramMessage: order.telegramMessage ?? input.telegramMessage,
      fulfillmentMethod: order.fulfillmentMethod as PersistedOrderSummary["fulfillmentMethod"],
      source: order.source as PersistedOrderSummary["source"],
    } satisfies PersistedOrderSummary;
  });
}

export async function getOrderByInvoiceId(invoiceId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.invoiceId, invoiceId))
    .limit(1);

  return row ? mapOrderRowToRecord(row) : null;
}

export async function getOrderById(orderId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  return row ? mapOrderRowToRecord(row) : null;
}

export async function getOrderByShortOrderId(shortOrderId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.shortOrderId, shortOrderId))
    .limit(1);

  return row ? mapOrderRowToRecord(row) : null;
}

export async function getOrderByOrderCode(orderCode: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderCode, orderCode))
    .limit(1);

  return row ? mapOrderRowToRecord(row) : null;
}

export async function getOrderByLookup(lookup: string) {
  const normalizedLookup = normalizeOrderLookupInput(lookup);

  if (!normalizedLookup) {
    return null;
  }

  if (isHumanOrderCode(normalizedLookup)) {
    return getOrderByOrderCode(normalizedLookup);
  }

  if (isLegacyShortOrderId(normalizedLookup)) {
    return getOrderByShortOrderId(normalizedLookup);
  }

  return null;
}

export async function getOrderItemsByOrderId(orderId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  return rows.map(mapOrderItemRowToRecord);
}

export async function getOrderWithItemsById(orderId: string): Promise<OrderWithItemsRecord | null> {
  const [order, items] = await Promise.all([
    getOrderById(orderId),
    getOrderItemsByOrderId(orderId),
  ]);

  if (!order) {
    return null;
  }

  return { order, items };
}

export async function getOrderWithItemsByShortOrderId(
  shortOrderId: string,
): Promise<OrderWithItemsRecord | null> {
  const order = await getOrderByShortOrderId(shortOrderId);

  if (!order) {
    return null;
  }

  const items = await getOrderItemsByOrderId(order.id);
  return { order, items };
}

export async function getOrderWithItemsByLookup(
  lookup: string,
): Promise<OrderWithItemsRecord | null> {
  const order = await getOrderByLookup(lookup);

  if (!order) {
    return null;
  }

  const items = await getOrderItemsByOrderId(order.id);
  return { order, items };
}

export async function getOrderStatusHistory(orderId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(orderStatusHistoryTable)
    .where(eq(orderStatusHistoryTable.orderId, orderId))
    .orderBy(desc(orderStatusHistoryTable.createdAt));

  return rows.map(mapHistoryRowToRecord);
}

export async function listOrdersForAdmin(
  statuses: OrderStatus[] = [...OPEN_ADMIN_ORDER_STATUSES],
  limit = 12,
) {
  const db = getDb();
  const rows = await db
    .select()
    .from(ordersTable)
    .where(inArray(ordersTable.status, statuses))
    .orderBy(desc(ordersTable.createdAt))
    .limit(limit);

  return rows.map(mapOrderRowToRecord);
}

export async function listOrdersForTelegramCustomer(
  telegramUserId: string,
  limit = 6,
) {
  const db = getDb();
  const rows = await db
    .select()
    .from(ordersTable)
    .where(
      or(
        eq(ordersTable.telegramUserId, telegramUserId),
        eq(ordersTable.telegramCustomerUserId, telegramUserId),
      ),
    )
    .orderBy(desc(ordersTable.createdAt))
    .limit(limit);

  return rows.map(mapOrderRowToRecord);
}

const RESUMABLE_ORDER_STATUSES = [
  "draft",
  "pending",
  "accepted",
  "needs_clarification",
  "processing",
] as const satisfies OrderStatus[];

export async function getLatestResumableOrderForTelegramUser(telegramUserId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(
      and(
        inArray(ordersTable.status, [...RESUMABLE_ORDER_STATUSES]),
        or(
          eq(ordersTable.telegramUserId, telegramUserId),
          eq(ordersTable.telegramCustomerUserId, telegramUserId),
        ),
      ),
    )
    .orderBy(desc(ordersTable.updatedAt), desc(ordersTable.createdAt))
    .limit(1);

  return row ? mapOrderRowToRecord(row) : null;
}

export async function attachOrderTelegramIdentity(input: {
  orderId: string;
  telegramUserId: string;
  telegramUsername?: string | null;
}) {
  const db = getDb();
  const [row] = await db
    .update(ordersTable)
    .set({
      telegramUserId: input.telegramUserId,
      telegramUsername: input.telegramUsername ?? null,
      telegramCustomerUserId: input.telegramUserId,
      telegramCustomerUsername: input.telegramUsername ?? null,
      updatedAt: new Date(),
    })
    .where(eq(ordersTable.id, input.orderId))
    .returning();

  return row ? mapOrderRowToRecord(row) : null;
}

export async function searchOrdersForSalesSupport(query: string, limit = 6) {
  return searchOrdersByLookup(query, limit);
}

export async function searchOrdersByLookup(query: string, limit = 6) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const digitsOnly = normalizedQuery.replace(/\D/g, "");
  const db = getDb();
  const filters = [
    eq(ordersTable.id, normalizedQuery),
    eq(ordersTable.invoiceId, normalizedQuery),
    eq(ordersTable.shortOrderId, normalizedQuery),
    eq(ordersTable.orderCode, normalizedQuery),
  ];

  if (digitsOnly.length >= 6) {
    filters.push(
      sql`regexp_replace(coalesce(${ordersTable.customerPhone}, ''), '[^0-9]', '', 'g') like ${`%${digitsOnly}%`}`,
    );
  }

  const rows = await db
    .select()
    .from(ordersTable)
    .where(or(...filters))
    .orderBy(desc(ordersTable.createdAt))
    .limit(limit);

  return rows.map(mapOrderRowToRecord);
}

export async function logOrderHistoryEntry(input: {
  orderId: string;
  action: string;
  actorType: OrderStatusActorType;
  actorId?: string | null;
  actorName?: string | null;
  reason?: string | null;
}) {
  const db = getDb();
  const [existingOrder] = await db
    .select({
      id: ordersTable.id,
      status: ordersTable.status,
    })
    .from(ordersTable)
    .where(eq(ordersTable.id, input.orderId))
    .limit(1);

  if (!existingOrder) {
    return null;
  }

  const [entry] = await db
    .insert(orderStatusHistoryTable)
    .values({
      orderId: input.orderId,
      fromStatus: existingOrder.status,
      toStatus: existingOrder.status,
      action: input.action,
      reason: input.reason ?? null,
      actorType: input.actorType,
      actorId: input.actorId ?? null,
      actorName: input.actorName ?? null,
    })
    .returning();

  return mapHistoryRowToRecord(entry);
}

export async function applyOrderStatusUpdate(input: ApplyOrderStatusUpdateInput) {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [existingOrder] = await tx
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, input.orderId))
      .limit(1);

    if (!existingOrder) {
      return null;
    }

    const nextStatus = orderStatusSchema.parse(input.nextStatus);
    const now = new Date();
    const [order] = await tx
      .update(ordersTable)
      .set({
        status: nextStatus,
        adminNote: input.adminNote ?? existingOrder.adminNote,
        rejectionReason: input.rejectionReason ?? existingOrder.rejectionReason,
        reviewedByTelegramUserId:
          input.actorId === undefined
            ? existingOrder.reviewedByTelegramUserId
            : input.actorId,
        reviewedByName:
          input.actorName === undefined ? existingOrder.reviewedByName : input.actorName,
        updatedAt: now,
        ...buildOrderStatusTimestampPatch(nextStatus),
      })
      .where(eq(ordersTable.id, input.orderId))
      .returning();

    await tx.insert(orderStatusHistoryTable).values({
      orderId: order.id,
      fromStatus: existingOrder.status,
      toStatus: nextStatus,
      action: input.action,
      reason: input.reason ?? null,
      actorType: input.actorType,
      actorId: input.actorId ?? null,
      actorName: input.actorName ?? null,
    });

    return mapOrderRowToRecord(order);
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return applyOrderStatusUpdate({
    orderId,
    nextStatus: status,
    action: "status_update",
    actorType: "system",
  });
}
