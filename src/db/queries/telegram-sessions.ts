import { and, eq, gt, isNull, or } from "drizzle-orm";
import type {
  TelegramAdminPendingAction,
  TelegramBotRole,
  TelegramSessionLanguage,
} from "../../../packages/shared/src";
import { getDb } from "@/db/client";
import { deeplinkPayloadsTable, telegramSessionsTable } from "@/db/schema";

export interface UpsertTelegramSessionInput {
  botRole?: TelegramBotRole;
  telegramUserId: string;
  telegramChatId?: string | null;
  username?: string | null;
  language?: TelegramSessionLanguage | null;
  currentStep: string;
  source: string;
  draftOrderId?: string | null;
  resumeOrderId?: string | null;
  resumeOrderCode?: string | null;
  lastPayloadReferenceId?: string | null;
  lastStartPayload?: string | null;
  pendingAdminAction?: TelegramAdminPendingAction | null;
  sessionJson: Record<string, unknown>;
}

export async function getTelegramSession(
  telegramUserId: string,
  botRole: TelegramBotRole = "customer",
) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(telegramSessionsTable)
    .where(
      and(
        eq(telegramSessionsTable.telegramUserId, telegramUserId),
        eq(telegramSessionsTable.botRole, botRole),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function upsertTelegramSession(input: UpsertTelegramSessionInput) {
  const db = getDb();
  const botRole = input.botRole ?? "customer";
  const [row] = await db
    .insert(telegramSessionsTable)
    .values({
      botRole,
      telegramUserId: input.telegramUserId,
      telegramChatId: input.telegramChatId ?? null,
      username: input.username ?? null,
      language: input.language ?? null,
      currentStep: input.currentStep,
      pendingAdminAction: input.pendingAdminAction ?? null,
      source: input.source,
      draftOrderId: input.draftOrderId ?? null,
      resumeOrderId: input.resumeOrderId ?? null,
      resumeOrderCode: input.resumeOrderCode ?? null,
      lastPayloadReferenceId: input.lastPayloadReferenceId ?? null,
      lastStartPayload: input.lastStartPayload ?? null,
      sessionJson: input.sessionJson,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [telegramSessionsTable.botRole, telegramSessionsTable.telegramUserId],
      set: {
        telegramChatId: input.telegramChatId ?? null,
        username: input.username ?? null,
        language: input.language ?? null,
        currentStep: input.currentStep,
        pendingAdminAction: input.pendingAdminAction ?? null,
        source: input.source,
        draftOrderId: input.draftOrderId ?? null,
        resumeOrderId: input.resumeOrderId ?? null,
        resumeOrderCode: input.resumeOrderCode ?? null,
        lastPayloadReferenceId: input.lastPayloadReferenceId ?? null,
        lastStartPayload: input.lastStartPayload ?? null,
        sessionJson: input.sessionJson,
        updatedAt: new Date(),
      },
    })
    .returning();

  return row;
}

export async function clearTelegramSession(
  telegramUserId: string,
  botRole: TelegramBotRole = "customer",
) {
  const db = getDb();
  const [row] = await db
    .delete(telegramSessionsTable)
    .where(
      and(
        eq(telegramSessionsTable.telegramUserId, telegramUserId),
        eq(telegramSessionsTable.botRole, botRole),
      ),
    )
    .returning();

  return row ?? null;
}

export async function storeDeeplinkPayload(input: {
  payloadType: string;
  payloadJson: Record<string, unknown>;
  expiresAt?: Date | null;
}) {
  const db = getDb();
  const [row] = await db
    .insert(deeplinkPayloadsTable)
    .values({
      payloadType: input.payloadType,
      payloadJson: input.payloadJson,
      expiresAt: input.expiresAt ?? null,
    })
    .returning();

  return row;
}

export async function getDeeplinkPayload(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(deeplinkPayloadsTable)
    .where(
      and(
        eq(deeplinkPayloadsTable.id, id),
        or(
          isNull(deeplinkPayloadsTable.expiresAt),
          gt(
            deeplinkPayloadsTable.expiresAt,
            new Date(Date.now() - 1),
          ),
        ),
      ),
    )
    .limit(1);

  return row ?? null;
}
