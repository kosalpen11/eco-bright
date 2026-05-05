import type {
  OrderSource,
  TelegramSalesPendingAction,
  TelegramSalesSessionState,
  TelegramSessionLanguage,
  TelegramSessionStep,
} from "../../../../packages/shared/src";
import {
  attachOrderTelegramIdentity,
  getLatestResumableOrderForTelegramUser,
  getOrderWithItemsById,
  getOrderWithItemsByLookup,
  logOrderHistoryEntry,
  searchOrdersByLookup,
} from "../../../../src/db/queries/orders";
import {
  clearTelegramSession,
  getTelegramSession,
  upsertTelegramSession,
} from "../../../../src/db/queries/telegram-sessions";

function createEmptySalesState(): TelegramSalesSessionState {
  return {
    source: "telegram-bot",
    language: null,
    selectedOrderId: null,
    selectedOrderCode: null,
    selectedShortOrderId: null,
    pendingAction: null,
    lastFreeformMessage: null,
  };
}

function formatStatus(status: string, language: TelegramSessionLanguage) {
  const normalized = status.replace(/_/g, " ");

  if (language === "kh") {
    switch (status) {
      case "pending":
        return "កំពុងរង់ចាំ";
      case "accepted":
        return "បានទទួល";
      case "rejected":
        return "បានបដិសេធ";
      case "needs_clarification":
        return "ត្រូវការបញ្ជាក់បន្ថែម";
      case "processing":
        return "កំពុងដំណើរការ";
      case "completed":
        return "បានបញ្ចប់";
      case "cancelled":
        return "បានបោះបង់";
      default:
        return normalized;
    }
  }

  return normalized;
}

function formatFulfillment(
  value: "pickup" | "delivery" | null,
  language: TelegramSessionLanguage,
) {
  if (language === "kh") {
    if (value === "pickup") {
      return "មកយកដោយខ្លួនឯង";
    }

    if (value === "delivery") {
      return "ដឹកជញ្ជូន";
    }

    return "មិនទាន់កំណត់";
  }

  if (value === "pickup") {
    return "Pickup";
  }

  if (value === "delivery") {
    return "Delivery";
  }

  return "Not set";
}

export class SalesOrderService {
  async getSession(telegramUserId: string) {
    const row = await getTelegramSession(telegramUserId, "sales");

    if (!row) {
      return {
        currentStep: "sales_home" as TelegramSessionStep,
        state: createEmptySalesState(),
        selectedOrderId: null,
        telegramChatId: null,
        lastStartPayload: null,
      };
    }

    return {
      currentStep: row.currentStep as TelegramSessionStep,
      state: {
        ...createEmptySalesState(),
        ...(row.sessionJson as TelegramSalesSessionState),
        language:
          ((row.sessionJson as TelegramSalesSessionState).language ??
            row.language ??
            null) as TelegramSalesSessionState["language"],
      },
      selectedOrderId:
        (row.sessionJson as TelegramSalesSessionState).selectedOrderId ??
        row.resumeOrderId ??
        null,
      telegramChatId: row.telegramChatId ?? null,
      lastStartPayload: row.lastStartPayload ?? null,
    };
  }

  async saveSession(input: {
    telegramUserId: string;
    telegramChatId?: string | null;
    username?: string | null;
    currentStep: TelegramSessionStep;
    state: TelegramSalesSessionState;
    source?: OrderSource;
    lastStartPayload?: string | null;
  }) {
    return upsertTelegramSession({
      botRole: "sales",
      telegramUserId: input.telegramUserId,
      telegramChatId: input.telegramChatId ?? null,
      username: input.username ?? null,
      language: input.state.language ?? null,
      currentStep: input.currentStep,
      source: input.source ?? input.state.source ?? "telegram-bot",
      draftOrderId: input.state.selectedOrderId ?? null,
      resumeOrderId: input.state.selectedOrderId ?? null,
      resumeOrderCode: input.state.selectedOrderCode ?? null,
      lastStartPayload: input.lastStartPayload ?? null,
      sessionJson: input.state as unknown as Record<string, unknown>,
    });
  }

  async resetSession(telegramUserId: string) {
    return clearTelegramSession(telegramUserId, "sales");
  }

  async getLatestLinkedOrder(telegramUserId: string) {
    return getLatestResumableOrderForTelegramUser(telegramUserId);
  }

  async lookupOrders(query: string, limit = 6) {
    return searchOrdersByLookup(query, limit);
  }

  async getSupportContext(input: {
    lookup?: string | null;
    orderId?: string | null;
    telegramUserId?: string;
    telegramUsername?: string | null;
    language?: TelegramSessionLanguage | null;
  }) {
    const language = input.language === "kh" ? "kh" : "en";
    const result = input.orderId
      ? await getOrderWithItemsById(input.orderId)
      : input.lookup
      ? await getOrderWithItemsByLookup(input.lookup)
      : null;

    if (!result) {
      return null;
    }

    if (input.telegramUserId) {
      await attachOrderTelegramIdentity({
        orderId: result.order.id,
        telegramUserId: input.telegramUserId,
        telegramUsername: input.telegramUsername ?? null,
      });
    }

    const orderLabel = result.order.orderCode ?? result.order.shortOrderId ?? result.order.id;
    const message =
      language === "kh"
        ? [
            "យើងបានរកឃើញការបញ្ជាទិញរបស់អ្នក។ សូមជ្រើសរើសអ្វីដែលអ្នកត្រូវការ។",
            "",
            `លេខសម្គាល់: ${orderLabel}`,
            `លេខវិក្កយបត្រ: ${result.order.invoiceId}`,
            `ស្ថានភាព: ${formatStatus(result.order.status, language)}`,
            `ការទទួល: ${formatFulfillment(result.order.fulfillmentMethod, language)}`,
            `សរុប: ${result.order.total.toFixed(2)} ${result.order.currency}`,
          ].join("\n")
        : [
            "We found your order. Choose what you need help with.",
            "",
            `Order ID: ${orderLabel}`,
            `Invoice ID: ${result.order.invoiceId}`,
            `Status: ${formatStatus(result.order.status, language)}`,
            `Fulfillment: ${formatFulfillment(result.order.fulfillmentMethod, language)}`,
            `Total: ${result.order.total.toFixed(2)} ${result.order.currency}`,
          ].join("\n");

    const state: TelegramSalesSessionState = {
      source: "telegram-bot",
      language,
      selectedOrderId: result.order.id,
      selectedOrderCode: result.order.orderCode,
      selectedShortOrderId: result.order.shortOrderId,
      pendingAction: null,
      lastFreeformMessage: null,
    };

    return {
      order: result.order,
      items: result.items,
      state,
      message,
    };
  }

  async logSalesAction(input: {
    orderId: string;
    action: string;
    actorId: string;
    actorName?: string | null;
    reason?: string | null;
  }) {
    return logOrderHistoryEntry({
      orderId: input.orderId,
      action: input.action,
      actorType: "sales",
      actorId: input.actorId,
      actorName: input.actorName ?? null,
      reason: input.reason ?? null,
    });
  }

  async setPendingAction(input: {
    telegramUserId: string;
    telegramChatId?: string | null;
    username?: string | null;
    language?: TelegramSessionLanguage | null;
    orderId: string;
    orderCode?: string | null;
    shortOrderId?: string | null;
    pendingAction: TelegramSalesPendingAction;
    currentStep: TelegramSessionStep;
  }) {
    const state: TelegramSalesSessionState = {
      source: "telegram-bot",
      language: input.language ?? null,
      selectedOrderId: input.orderId,
      selectedOrderCode: input.orderCode ?? null,
      selectedShortOrderId: input.shortOrderId ?? null,
      pendingAction: input.pendingAction,
      lastFreeformMessage: null,
    };

    await this.saveSession({
      telegramUserId: input.telegramUserId,
      telegramChatId: input.telegramChatId ?? null,
      username: input.username ?? null,
      currentStep: input.currentStep,
      state,
    });

    return state;
  }
}
