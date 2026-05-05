import { buildOrderSummaryMessage, buildProductMessage } from "../../../../packages/telegram-core/src";
import {
  createDraftOrder,
  finalizeOrder,
  updateDraftOrderItems,
} from "../../../../packages/order-core/src";
import { getOrderById } from "../../../../src/db/queries/orders";
import { getProductById } from "../../../../src/db/queries/products";
import type { TelegramPurchaseSessionState } from "../../../../packages/shared/src";

export interface TelegramCustomerIdentity {
  telegramUserId: string;
  telegramUsername?: string | null;
  telegramChatId?: string | null;
}

async function buildDraftItems(state: TelegramPurchaseSessionState) {
  return Promise.all(
    state.items.map(async (item) => {
      const product = await getProductById(item.productId);

      if (!product || !product.inStock || !product.isActive) {
        throw new Error(`Product unavailable: ${item.productId}`);
      }

      return {
        productId: product.id,
        title: product.title,
        price: product.price,
        qty: item.qty,
        imageUrl: product.imageUrl,
        category: product.category,
      };
    }),
  );
}

function buildPersistedOrderNote(state: TelegramPurchaseSessionState) {
  const fulfillmentNote = state.fulfillmentMethod
    ? `Fulfillment: ${state.fulfillmentMethod === "pickup" ? "Pickup" : "Delivery"}`
    : null;

  if (state.note && fulfillmentNote) {
    return `${fulfillmentNote}\n${state.note}`;
  }

  return fulfillmentNote ?? state.note ?? null;
}

export async function startProductPurchase(input: {
  productId: string;
  source: "telegram-bot" | "telegram-deeplink" | "pasted-link";
  quantity?: number;
}) {
  const product = await getProductById(input.productId);

  if (!product || !product.isActive || !product.inStock) {
    throw new Error("That product is unavailable right now.");
  }

  const qty = input.quantity ?? 1;

  return {
    product,
    message: buildProductMessage({ product, quantity: qty }),
    state: {
      source: input.source,
      items: [{ productId: product.id, qty }],
      orderCode: null,
      shortOrderId: null,
      currentProductId: product.id,
      fulfillmentMethod: null,
      customerName: null,
      customerPhone: null,
      note: null,
      deeplinkReferenceId: null,
      draftOrderId: null,
      lastResolvedLink: null,
    } satisfies TelegramPurchaseSessionState,
  };
}

export async function createOrRefreshDraftFromState(input: {
    shop: string;
    state: TelegramPurchaseSessionState;
    telegramIdentity?: TelegramCustomerIdentity;
  }) {
  const items = await buildDraftItems(input.state);

  if (input.state.draftOrderId) {
    const existingDraft = await getOrderById(input.state.draftOrderId);

    if (existingDraft?.status === "draft") {
      return updateDraftOrderItems({
        orderId: existingDraft.id,
        items,
        orderCode: input.state.orderCode ?? existingDraft.orderCode ?? null,
        customerName: input.state.customerName ?? null,
        customerPhone: input.state.customerPhone ?? null,
        note: buildPersistedOrderNote(input.state),
        telegramCustomerUserId: input.telegramIdentity?.telegramUserId ?? null,
        telegramCustomerUsername: input.telegramIdentity?.telegramUsername ?? null,
        telegramCustomerChatId: input.telegramIdentity?.telegramChatId ?? null,
      });
    }
  }

  return createDraftOrder({
    shop: input.shop,
    currency: "USD",
    source: input.state.source,
    items,
    orderCode: input.state.orderCode ?? null,
    customerName: input.state.customerName,
    customerPhone: input.state.customerPhone,
    note: buildPersistedOrderNote(input.state),
    telegramCustomerUserId: input.telegramIdentity?.telegramUserId ?? null,
    telegramCustomerUsername: input.telegramIdentity?.telegramUsername ?? null,
    telegramCustomerChatId: input.telegramIdentity?.telegramChatId ?? null,
  });
}

export async function prepareReviewFromState(input: {
  shop: string;
  state: TelegramPurchaseSessionState;
  telegramIdentity?: TelegramCustomerIdentity;
}) {
  const draftOrder = await createOrRefreshDraftFromState(input);

  return {
    draftOrder,
    state: {
      ...input.state,
      orderCode: draftOrder.orderCode ?? input.state.orderCode ?? null,
      shortOrderId: draftOrder.shortOrderId ?? input.state.shortOrderId ?? null,
      draftOrderId: draftOrder.id,
    } satisfies TelegramPurchaseSessionState,
  };
}

export async function finalizePurchaseFromState(input: {
  orderId: string;
  state: TelegramPurchaseSessionState;
  telegramIdentity?: TelegramCustomerIdentity;
}) {
  const order = await finalizeOrder({
    orderId: input.orderId,
    customerName: input.state.customerName,
    customerPhone: input.state.customerPhone,
    note: buildPersistedOrderNote(input.state),
    status: "pending",
    telegramCustomerUserId: input.telegramIdentity?.telegramUserId ?? null,
    telegramCustomerUsername: input.telegramIdentity?.telegramUsername ?? null,
    telegramCustomerChatId: input.telegramIdentity?.telegramChatId ?? null,
  });

  const items = await Promise.all(
    input.state.items.map(async (item) => {
      const product = await getProductById(item.productId);

      if (!product) {
        throw new Error(`Missing product for final summary: ${item.productId}`);
      }

      return {
        title: product.title,
        qty: item.qty,
        price: product.price,
        lineTotal: product.price * item.qty,
      };
    }),
  );

  return {
    order,
    summaryMessage: buildOrderSummaryMessage({
      orderId: order.orderCode ?? order.shortOrderId ?? order.id,
      invoiceId: order.invoiceId,
      shop: order.shop,
      currency: order.currency,
      items,
      subtotal: order.subtotal,
      total: order.total,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      note: order.note,
    }),
  };
}
