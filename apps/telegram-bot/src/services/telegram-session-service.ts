import {
  clearTelegramSession,
  getTelegramSession,
  upsertTelegramSession,
} from "../../../../src/db/queries/telegram-sessions";
import type {
  TelegramBotRole,
  OrderSource,
  TelegramPurchaseSessionState,
  TelegramSessionStep,
} from "../../../../packages/shared/src";

function createEmptyState(source: OrderSource): TelegramPurchaseSessionState {
  return {
    source,
    items: [],
    orderCode: null,
    shortOrderId: null,
    currentProductId: null,
    fulfillmentMethod: null,
    customerName: null,
    customerPhone: null,
    note: null,
    deeplinkReferenceId: null,
    draftOrderId: null,
    lastResolvedLink: null,
  };
}

export class TelegramSessionService {
  constructor(private readonly botRole: TelegramBotRole = "customer") {}

  async getState(telegramUserId: string, source: OrderSource = "telegram-bot") {
    const row = await getTelegramSession(telegramUserId, this.botRole);

    if (!row) {
      return {
        currentStep: "idle" as TelegramSessionStep,
        state: createEmptyState(source),
      };
    }

    return {
      currentStep: row.currentStep as TelegramSessionStep,
      state: {
        ...(row.sessionJson as TelegramPurchaseSessionState),
        language:
          ((row.sessionJson as TelegramPurchaseSessionState).language ??
            row.language ??
            null) as TelegramPurchaseSessionState["language"],
      },
      draftOrderId: row.draftOrderId,
      resumeOrderId: row.resumeOrderId,
      resumeOrderCode: row.resumeOrderCode,
      lastPayloadReferenceId: row.lastPayloadReferenceId,
      lastStartPayload: row.lastStartPayload,
      telegramChatId: row.telegramChatId,
    };
  }

  async save(input: {
    telegramUserId: string;
    telegramChatId?: string | null;
    username?: string | null;
    currentStep: TelegramSessionStep;
    source: OrderSource;
    state: TelegramPurchaseSessionState;
    draftOrderId?: string | null;
    resumeOrderId?: string | null;
    resumeOrderCode?: string | null;
    lastPayloadReferenceId?: string | null;
    lastStartPayload?: string | null;
  }) {
    return upsertTelegramSession({
      botRole: this.botRole,
      telegramUserId: input.telegramUserId,
      telegramChatId: input.telegramChatId ?? null,
      username: input.username ?? null,
      language: input.state.language ?? null,
      currentStep: input.currentStep,
      source: input.source,
      draftOrderId: input.draftOrderId ?? null,
      resumeOrderId: input.resumeOrderId ?? input.draftOrderId ?? input.state.draftOrderId ?? null,
      resumeOrderCode: input.resumeOrderCode ?? input.state.orderCode ?? null,
      lastPayloadReferenceId: input.lastPayloadReferenceId ?? null,
      lastStartPayload: input.lastStartPayload ?? null,
      sessionJson: input.state as unknown as Record<string, unknown>,
    });
  }

  async reset(telegramUserId: string) {
    return clearTelegramSession(telegramUserId, this.botRole);
  }
}
