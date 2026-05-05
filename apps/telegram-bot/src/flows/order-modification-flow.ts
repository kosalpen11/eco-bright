import type { TelegramPurchaseSessionState, TelegramSessionStep } from "../../../../packages/shared/src";
import {
  attachOrderTelegramIdentity,
  getOrderWithItemsById,
  getOrderWithItemsByLookup,
} from "../../../../src/db/queries/orders";

interface RestoredOrderContext {
  id: string;
  shop: string;
  shortOrderId: string | null;
  orderCode: string | null;
  invoiceId: string;
  status: string;
  customerName: string | null;
  customerPhone: string | null;
  fulfillmentMethod: "pickup" | "delivery" | null;
  note: string | null;
  subtotal: number;
  total: number;
  currency: string;
  source: string;
  items: Array<{
    id: string;
    productId: string;
    title: string;
    price: number;
    qty: number;
    lineTotal: number;
    imageUrl: string | null;
    category: string | null;
  }>;
}

export interface RestoredOrderFlowResult {
  state: TelegramPurchaseSessionState;
  message: string;
  order: RestoredOrderContext;
  currentStep: TelegramSessionStep;
  mode: "continuation" | "pending" | "status";
}

function mapOrderResultToContext(
  result: NonNullable<Awaited<ReturnType<typeof getOrderWithItemsByLookup>>>,
): RestoredOrderContext {
  return {
    id: result.order.id,
    shop: result.order.shop,
    shortOrderId: result.order.shortOrderId,
    orderCode: result.order.orderCode,
    invoiceId: result.order.invoiceId,
    status: result.order.status,
    customerName: result.order.customerName,
    customerPhone: result.order.customerPhone,
    fulfillmentMethod: result.order.fulfillmentMethod,
    note: result.order.note,
    subtotal: result.order.subtotal,
    total: result.order.total,
    currency: result.order.currency,
    source: result.order.source,
    items: result.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      title: item.title,
      price: item.price,
      qty: item.qty,
      lineTotal: item.lineTotal,
      imageUrl: item.imageUrl,
      category: item.category,
    })),
  };
}

function buildState(order: RestoredOrderContext): TelegramPurchaseSessionState {
  return {
    source: "telegram-deeplink",
    items: order.items.map((item) => ({
      productId: item.productId,
      qty: item.qty,
    })),
    orderCode: order.orderCode,
    shortOrderId: order.shortOrderId,
    currentProductId: null,
    fulfillmentMethod: order.fulfillmentMethod ?? undefined,
    customerName: order.customerName ?? undefined,
    customerPhone: order.customerPhone ?? undefined,
    note: order.note ?? undefined,
    deeplinkReferenceId: order.invoiceId,
    draftOrderId: order.id,
    lastResolvedLink: null,
  };
}

function formatFulfillment(value: RestoredOrderContext["fulfillmentMethod"]) {
  if (value === "pickup") {
    return "Pickup";
  }

  if (value === "delivery") {
    return "Delivery";
  }

  return "Not set";
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function buildOrderMessage(order: RestoredOrderContext, isModifiable: boolean, lang: "kh" | "en" = "en") {
  const itemsText = order.items.map((item) => `• ${item.title} × ${item.qty}`).join("\n");

  if (lang === "kh") {
    return [
      `ការបញ្ជាទិញរបស់អ្នកពី ${order.shop} រួចរាល់ហើយ។`,
      "",
      order.orderCode ? `លេខសម្គាល់: ${order.orderCode}` : null,
      `លេខវិក្កយបត្រ: ${order.invoiceId}`,
      `ស្ថានភាព: ${formatStatus(order.status)}`,
      itemsText ? `ទំនិញ:\n${itemsText}` : null,
      `ការទទួល: ${order.fulfillmentMethod === "pickup" ? "មកយកដោយខ្លួនឯង" : order.fulfillmentMethod === "delivery" ? "ដឹកជញ្ជូន" : "មិនទាន់ជ្រើស"}`,
      `សរុប: ${order.total.toFixed(2)} ${order.currency}`,
      "",
      order.status === "pending"
        ? "ការបញ្ជាទិញរបស់អ្នកត្រូវបានរក្សាទុក។ សូមទាក់ទងផ្នែកលក់ដើម្បីបញ្ជាក់ ឬស្វែងយល់ពីការដឹកជញ្ជូន។"
        : isModifiable
        ? "ជ្រើសរើសសកម្មភាពដែលអ្នកចង់ធ្វើ។"
        : "ការបញ្ជាទិញនេះកំពុងដំណើរការ។ អ្នកអាចពិនិត្យស្ថានភាព ឬបន្តជាមួយផ្នែកលក់។",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `Your order from ${order.shop} is ready.`,
    "",
    order.orderCode ? `Short Order ID: ${order.orderCode}` : null,
    order.shortOrderId ? `Order ID: ${order.shortOrderId}` : null,
    `Invoice ID: ${order.invoiceId}`,
    `Status: ${formatStatus(order.status)}`,
    itemsText ? `Items:\n${itemsText}` : null,
    `Fulfillment: ${formatFulfillment(order.fulfillmentMethod)}`,
    `Total: ${order.total.toFixed(2)} ${order.currency}`,
    "",
    order.status === "pending"
      ? "Your order is saved and waiting for confirmation.\nPlease contact our sales team to confirm stock, delivery, or pickup details."
      : isModifiable
      ? "Choose what you want to do next."
      : "This order is already in progress. You can check status or continue with sales.",
  ]
    .filter(Boolean)
    .join("\n");
}

async function restoreOrderByLookup(lookup: string): Promise<RestoredOrderContext> {
  const result = await getOrderWithItemsByLookup(lookup);

  if (!result) {
    throw new Error(
      `Order ${lookup} was not found. Paste a valid short order ID like ECO-8K4P2.`,
    );
  }

  return mapOrderResultToContext(result);
}

export async function restoreOrderFlowFromLookup(input: {
  lookup: string;
  telegramUserId?: string;
  telegramUsername?: string | null;
  lang?: "kh" | "en";
}): Promise<RestoredOrderFlowResult> {
  const order = await restoreOrderByLookup(input.lookup);

  if (input.telegramUserId) {
    await attachOrderTelegramIdentity({
      orderId: order.id,
      telegramUserId: input.telegramUserId,
      telegramUsername: input.telegramUsername ?? null,
    });
  }

  const modifiableStatuses = ["draft", "pending"];
  const isModifiable = modifiableStatuses.includes(order.status);
  const isPending = order.status === "pending";
  const lang = input.lang ?? "en";

  return {
    state: buildState(order),
    message: buildOrderMessage(order, isModifiable, lang),
    order,
    currentStep: isModifiable ? "review" : "completed",
    mode: isPending ? "pending" : isModifiable ? "continuation" : "status",
  };
}

export async function restoreOrderFlowFromOrderId(input: {
  orderId: string;
  telegramUserId?: string;
  telegramUsername?: string | null;
  lang?: "kh" | "en";
}): Promise<RestoredOrderFlowResult> {
  const result = await getOrderWithItemsById(input.orderId);

  if (!result) {
    throw new Error("The saved order could not be found anymore.");
  }

  const order = mapOrderResultToContext(result);

  if (input.telegramUserId) {
    await attachOrderTelegramIdentity({
      orderId: order.id,
      telegramUserId: input.telegramUserId,
      telegramUsername: input.telegramUsername ?? null,
    });
  }

  const modifiableStatuses = ["draft", "pending"];
  const isModifiable = modifiableStatuses.includes(order.status);
  const isPending = order.status === "pending";
  const lang = input.lang ?? "en";

  return {
    state: buildState(order),
    message: buildOrderMessage(order, isModifiable, lang),
    order,
    currentStep: isModifiable ? "review" : "completed",
    mode: isPending ? "pending" : isModifiable ? "continuation" : "status",
  };
}

export async function startOrderModificationFlow(
  shortOrderId: string,
): Promise<RestoredOrderFlowResult> {
  return restoreOrderFlowFromLookup({ lookup: shortOrderId });
}
