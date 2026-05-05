import {
  getTelegramAdminRuntimeConfig,
  isTelegramAdminUser,
} from "../../../../packages/config/src";
import {
  buildAdminOrderKeyboard,
  buildAdminOrderMessage,
  buildAdminReasonPrompt,
} from "../../../../packages/telegram-core/src";
import {
  acceptOrder,
  addAdminNote,
  cancelOrder,
  completeOrder,
  markProcessing,
  rejectOrder,
  requestClarification,
  type AdminOrderActor,
} from "../../../../packages/order-core/src";
import type { TelegramAdminPendingAction, TelegramAdminSessionState } from "../../../../packages/shared/src";
import {
  getOrderWithItemsById,
  listOrdersForAdmin,
  searchOrdersByLookup,
} from "../../../../src/db/queries/orders";
import {
  getTelegramSession,
  upsertTelegramSession,
} from "../../../../src/db/queries/telegram-sessions";

function createEmptyAdminState(): TelegramAdminSessionState {
  return {
    source: "telegram-bot",
    selectedOrderId: null,
    pendingAction: null,
    targetChatId: null,
  };
}

function buildActorDisplayName(actor: AdminOrderActor) {
  if (actor.displayName) {
    return actor.displayName;
  }

  if (actor.username) {
    return `@${actor.username}`;
  }

  return actor.telegramUserId;
}

export class AdminOrderService {
  readonly config = getTelegramAdminRuntimeConfig();

  isAuthorized(telegramUserId: string) {
    return isTelegramAdminUser(telegramUserId);
  }

  assertAuthorized(telegramUserId: string, username?: string | null) {
    if (!this.isAuthorized(telegramUserId)) {
      console.warn("Unauthorized admin Telegram access attempt", {
        telegramUserId,
        username: username ?? null,
      });
      throw new Error("You are not authorized to manage orders.");
    }
  }

  async listIncomingOrders(limit = 6) {
    const orders = await listOrdersForAdmin(undefined, limit);

    return Promise.all(orders.map((order) => this.getOrderReview(order.id)));
  }

  async listOrdersByStatus(
    statuses: Array<"pending" | "accepted" | "needs_clarification" | "processing" | "completed">,
    limit = 6,
  ) {
    const orders = await listOrdersForAdmin(statuses, limit);
    return Promise.all(orders.map((order) => this.getOrderReview(order.id)));
  }

  async searchOrders(query: string, limit = 6) {
    const orders = await searchOrdersByLookup(query, limit);
    return Promise.all(orders.map((order) => this.getOrderReview(order.id)));
  }

  async getOrderReview(orderId: string) {
    const orderWithItems = await getOrderWithItemsById(orderId);

    if (!orderWithItems) {
      throw new Error(`Order not found: ${orderId}`);
    }

    const { order, items } = orderWithItems;

    return {
      order,
      items,
      text: buildAdminOrderMessage({
        orderId: order.id,
        invoiceId: order.invoiceId,
        shop: order.shop,
        source: order.source,
        currency: order.currency,
        status: order.status,
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        note: order.note,
        adminNote: order.adminNote,
        rejectionReason: order.rejectionReason,
        items: items.map((item) => ({
          title: item.title,
          qty: item.qty,
          price: item.price,
          lineTotal: item.lineTotal,
        })),
        subtotal: order.subtotal,
        total: order.total,
      }),
      keyboard: buildAdminOrderKeyboard({
        orderId: order.id,
        status: order.status,
      }),
    };
  }

  async beginPendingTextAction(input: {
    telegramUserId: string;
    username?: string | null;
    orderId: string;
    action: TelegramAdminPendingAction;
    targetChatId?: string | null;
  }) {
    const review = await this.getOrderReview(input.orderId);
    const nextState: TelegramAdminSessionState = {
      source: "telegram-bot",
      selectedOrderId: input.orderId,
      pendingAction: input.action,
      targetChatId: input.targetChatId ?? null,
    };

    await upsertTelegramSession({
      botRole: "admin",
      telegramUserId: input.telegramUserId,
      telegramChatId: input.targetChatId ?? null,
      username: input.username ?? null,
      currentStep:
        input.action === "note" ? "admin_awaiting_note" : "admin_awaiting_reason",
      pendingAdminAction: input.action,
      source: "telegram-bot",
      sessionJson: nextState as unknown as Record<string, unknown>,
    });

    return {
      review,
      prompt: buildAdminReasonPrompt({
        orderId: review.order.id,
        invoiceId: review.order.invoiceId,
        mode: input.action,
      }),
    };
  }

  async getPendingTextAction(telegramUserId: string) {
    const row = await getTelegramSession(telegramUserId, "admin");

    if (
      !row ||
      (row.currentStep !== "admin_awaiting_reason" &&
        row.currentStep !== "admin_awaiting_note")
    ) {
      return null;
    }

    return row;
  }

  async cancelPendingTextAction(input: {
    telegramUserId: string;
    username?: string | null;
  }) {
    await upsertTelegramSession({
      botRole: "admin",
      telegramUserId: input.telegramUserId,
      username: input.username ?? null,
      currentStep: "admin_review",
      pendingAdminAction: null,
      source: "telegram-bot",
      sessionJson: createEmptyAdminState() as unknown as Record<string, unknown>,
    });
  }

  async beginSearchMode(input: {
    telegramUserId: string;
    username?: string | null;
    targetChatId?: string | null;
  }) {
    await upsertTelegramSession({
      botRole: "admin",
      telegramUserId: input.telegramUserId,
      telegramChatId: input.targetChatId ?? null,
      username: input.username ?? null,
      currentStep: "admin_awaiting_search",
      pendingAdminAction: null,
      source: "telegram-bot",
      sessionJson: createEmptyAdminState() as unknown as Record<string, unknown>,
    });
  }

  async showMenuMode(input: {
    telegramUserId: string;
    username?: string | null;
    targetChatId?: string | null;
  }) {
    await upsertTelegramSession({
      botRole: "admin",
      telegramUserId: input.telegramUserId,
      telegramChatId: input.targetChatId ?? null,
      username: input.username ?? null,
      currentStep: "admin_home",
      pendingAdminAction: null,
      source: "telegram-bot",
      sessionJson: createEmptyAdminState() as unknown as Record<string, unknown>,
    });
  }

  async consumePendingTextAction(input: {
    telegramUserId: string;
    username?: string | null;
    text: string;
    actor: AdminOrderActor;
  }) {
    const row = await this.getPendingTextAction(input.telegramUserId);

    if (!row) {
      return null;
    }

    const state = row.sessionJson as TelegramAdminSessionState;
    const orderId = state.selectedOrderId;
    const pendingAction = state.pendingAction;

    if (!orderId || !pendingAction) {
      throw new Error("Admin session is missing its target order.");
    }

    switch (pendingAction) {
      case "reject":
        await rejectOrder({
          orderId,
          actor: input.actor,
          reason: input.text,
        });
        break;
      case "clarify":
        await requestClarification({
          orderId,
          actor: input.actor,
          reason: input.text,
        });
        break;
      case "note":
        await addAdminNote({
          orderId,
          actor: input.actor,
          note: input.text,
        });
        break;
    }

    await upsertTelegramSession({
      botRole: "admin",
      telegramUserId: input.telegramUserId,
      username: input.username ?? null,
      currentStep: "admin_review",
      pendingAdminAction: null,
      source: "telegram-bot",
      sessionJson: createEmptyAdminState() as unknown as Record<string, unknown>,
    });

    const review = await this.getOrderReview(orderId);

    return {
      review,
      confirmationText: `${buildActorDisplayName(input.actor)} updated order ${review.order.invoiceId}.`,
    };
  }

  async applyImmediateAction(input: {
    action: "accept" | "reject" | "processing" | "complete" | "cancel" | "refresh";
    orderId: string;
    actor: AdminOrderActor;
  }) {
    switch (input.action) {
      case "accept":
        await acceptOrder({
          orderId: input.orderId,
          actor: input.actor,
        });
        break;
      case "reject":
        await rejectOrder({
          orderId: input.orderId,
          actor: input.actor,
          reason: "Rejected by admin.",
        });
        break;
      case "processing":
        await markProcessing({
          orderId: input.orderId,
          actor: input.actor,
        });
        break;
      case "complete":
        await completeOrder({
          orderId: input.orderId,
          actor: input.actor,
        });
        break;
      case "cancel":
        await cancelOrder({
          orderId: input.orderId,
          actor: input.actor,
          reason: "Cancelled by admin.",
        });
        break;
      case "refresh":
        break;
    }

    return this.getOrderReview(input.orderId);
  }
}
