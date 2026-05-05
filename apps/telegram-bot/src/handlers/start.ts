import type { Bot } from "grammy";
import { getCatalogCategories } from "../../../../packages/catalog-core/src";
import { getSharedRuntimeConfig } from "../../../../packages/config/src";
import { getLatestResumableOrderForTelegramUser } from "../../../../src/db/queries/orders";
import { getProductByLookupKey } from "../../../../src/db/queries/products";
import {
  buildHomeKeyboard,
  buildLanguageKeyboard,
  buildResumeKeyboard,
  buildStartupFallbackKeyboard,
} from "../keyboards/common-keyboard";
import {
  buildOrderContinuationKeyboard,
  buildOrderReceivedKeyboard,
  buildPendingOrderKeyboard,
} from "../keyboards/order-keyboard";
import { buildProductKeyboard } from "../keyboards/product-keyboard";
import { parseStartPayload } from "../../../../packages/telegram-core/src";
import { startProductPurchase } from "../flows/purchase-flow";
import { restoreOrderFlowFromLookup } from "../flows/order-modification-flow";
import { startQuickOrderFromReference } from "../flows/quick-order-flow";
import { TelegramSessionService } from "../services/telegram-session-service";
import type { BotLang } from "../utils/format-message";
import {
  formatLanguagePromptMessage,
  formatPasteOrderCodePrompt,
  formatResumeMessage,
  formatStartupFallbackMessage,
  formatWelcomeMessage,
} from "../utils/format-message";

function createEmptySessionState() {
  return {
    source: "telegram-bot" as const,
    items: [],
    language: null as "kh" | "en" | null,
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

function getLang(session: { state: { language?: string | null } }): BotLang {
  return (session.state.language === "kh" ? "kh" : "en") as BotLang;
}

export function registerStartHandler(bot: Bot, sessionService: TelegramSessionService) {
  // ─── /start ────────────────────────────────────────────────────────────────
  bot.command("start", async (ctx) => {
    if (!ctx.from) return;

    const payload = ctx.match?.trim();
    const telegramUserId = String(ctx.from.id);
    const username = ctx.from.username ?? null;
    const config = getSharedRuntimeConfig();

    // ── LANGUAGE GATE ──────────────────────────────────────────────────────
    // Always check for a saved language first. If missing, ask before anything else.
    const existingSession = await sessionService.getState(telegramUserId);
    const hasLanguage = Boolean(existingSession.state.language);

    if (!hasLanguage) {
      // Save the payload so we can resume after language selection
      await sessionService.save({
        telegramUserId,
        username,
        currentStep: "awaiting_language",
        source: existingSession.state.source ?? "telegram-bot",
        state: {
          ...createEmptySessionState(),
          ...existingSession.state,
        },
        draftOrderId: existingSession.draftOrderId ?? null,
        resumeOrderId: existingSession.resumeOrderId ?? null,
        resumeOrderCode: existingSession.resumeOrderCode ?? null,
        lastPayloadReferenceId: existingSession.lastPayloadReferenceId ?? null,
        // Keep the start payload so we resume the right order after lang selection
        lastStartPayload: payload ?? existingSession.lastStartPayload ?? null,
      });

      await ctx.reply(
        formatLanguagePromptMessage(config.NEXT_PUBLIC_SHOP_NAME),
        { reply_markup: buildLanguageKeyboard() },
      );
      return;
    }

    const lang = getLang(existingSession);
    await handleStartWithContext({ ctx, telegramUserId, username, payload, lang, sessionService, config, existingSession });
  });

  // ─── lang:kh / lang:en ─────────────────────────────────────────────────────
  async function handleLangSelection(
    telegramUserId: string,
    username: string | null,
    selectedLang: BotLang,
    ctx: any,
  ) {
    const config = getSharedRuntimeConfig();
    const existingSession = await sessionService.getState(telegramUserId);

    // Persist the chosen language into session state
    const updatedState = {
      ...createEmptySessionState(),
      ...existingSession.state,
      language: selectedLang,
    };

    await sessionService.save({
      telegramUserId,
      username,
      currentStep: existingSession.currentStep === "awaiting_language" ? "home" : existingSession.currentStep,
      source: updatedState.source,
      state: updatedState,
      draftOrderId: existingSession.draftOrderId ?? null,
      resumeOrderId: existingSession.resumeOrderId ?? null,
      resumeOrderCode: existingSession.resumeOrderCode ?? null,
      lastPayloadReferenceId: existingSession.lastPayloadReferenceId ?? null,
      lastStartPayload: existingSession.lastStartPayload ?? null,
    });

    await ctx.answerCallbackQuery();

    // Resume the original start payload if one was saved before language selection
    const savedPayload = existingSession.lastStartPayload;
    const updatedSession = await sessionService.getState(telegramUserId);

    await handleStartWithContext({
      ctx,
      telegramUserId,
      username,
      payload: savedPayload ?? undefined,
      lang: selectedLang,
      sessionService,
      config,
      existingSession: updatedSession,
    });
  }

  bot.callbackQuery("lang:kh", async (ctx) => {
    if (!ctx.from) { await ctx.answerCallbackQuery({ text: "Missing context." }); return; }
    await handleLangSelection(String(ctx.from.id), ctx.from.username ?? null, "kh", ctx);
  });

  bot.callbackQuery("lang:en", async (ctx) => {
    if (!ctx.from) { await ctx.answerCallbackQuery({ text: "Missing context." }); return; }
    await handleLangSelection(String(ctx.from.id), ctx.from.username ?? null, "en", ctx);
  });

  // ─── resume:cancel ──────────────────────────────────────────────────────────
  bot.callbackQuery("resume:cancel", async (ctx) => {
    if (!ctx.from) { await ctx.answerCallbackQuery({ text: "Missing Telegram user context." }); return; }
    await sessionService.reset(String(ctx.from.id));
    await ctx.answerCallbackQuery();
    await ctx.reply("Your active order session was cancelled.", { reply_markup: buildHomeKeyboard() });
  });

  // ─── startup:paste-order-code ───────────────────────────────────────────────
  bot.callbackQuery("startup:paste-order-code", async (ctx) => {
    if (!ctx.from) { await ctx.answerCallbackQuery({ text: "Missing Telegram user context." }); return; }
    const telegramUserId = String(ctx.from.id);
    const existingSession = await sessionService.getState(telegramUserId);
    const lang = getLang(existingSession);

    await sessionService.save({
      telegramUserId,
      username: ctx.from.username ?? null,
      currentStep: "awaiting_order_code",
      source: existingSession.state.source ?? "telegram-bot",
      state: { ...createEmptySessionState(), ...existingSession.state },
      draftOrderId: existingSession.draftOrderId ?? null,
      resumeOrderId: existingSession.resumeOrderId ?? null,
      resumeOrderCode: existingSession.resumeOrderCode ?? existingSession.state.orderCode ?? null,
      lastPayloadReferenceId: existingSession.lastPayloadReferenceId ?? null,
      lastStartPayload: existingSession.lastStartPayload ?? null,
    });

    await ctx.answerCallbackQuery();
    await ctx.reply(formatPasteOrderCodePrompt(lang), { reply_markup: buildStartupFallbackKeyboard() });
  });

  // ─── menu:new-order ─────────────────────────────────────────────────────────
  bot.callbackQuery("menu:new-order", async (ctx) => {
    if (!ctx.from) { await ctx.answerCallbackQuery({ text: "Missing Telegram user context." }); return; }
    const config = getSharedRuntimeConfig();
    const telegramUserId = String(ctx.from.id);
    const existingSession = await sessionService.getState(telegramUserId);
    const lang = getLang(existingSession);

    await sessionService.save({
      telegramUserId,
      username: ctx.from.username ?? null,
      currentStep: "home",
      source: "telegram-bot",
      state: { ...createEmptySessionState(), language: lang },
    });

    await ctx.answerCallbackQuery();
    await ctx.reply(
      formatWelcomeMessage({
        shopName: config.NEXT_PUBLIC_SHOP_NAME,
        salesTarget: config.TELEGRAM_SUPPORT_TARGET ?? config.TELEGRAM_ORDER_TARGET,
      }, lang),
      { reply_markup: buildHomeKeyboard() },
    );
  });
}

// ─── Shared start context handler ───────────────────────────────────────────
async function handleStartWithContext(input: {
  ctx: any;
  telegramUserId: string;
  username: string | null;
  payload?: string | null;
  lang: BotLang;
  sessionService: TelegramSessionService;
  config: ReturnType<typeof getSharedRuntimeConfig>;
  existingSession: Awaited<ReturnType<TelegramSessionService["getState"]>>;
}) {
  const { ctx, telegramUserId, username, payload, lang, sessionService, config, existingSession } = input;

  if (!payload) {
    // No payload — check for resumable order
    const hasResumableOrder =
      existingSession.currentStep !== "completed" &&
      existingSession.currentStep !== "cancelled" &&
      existingSession.currentStep !== "idle" &&
      existingSession.state.items.length > 0;
    const linkedOrder =
      existingSession.resumeOrderId
        ? null
        : await getLatestResumableOrderForTelegramUser(telegramUserId);
    const resumeOrderId = existingSession.resumeOrderId ?? linkedOrder?.id ?? null;
    const resumeOrderCode =
      existingSession.resumeOrderCode ?? existingSession.state.orderCode ?? linkedOrder?.orderCode ?? null;

    if (hasResumableOrder || resumeOrderId) {
      await sessionService.save({
        telegramUserId,
        username,
        currentStep: existingSession.currentStep === "idle" ? "home" : existingSession.currentStep,
        source: existingSession.state.source ?? "telegram-bot",
        state: {
          ...existingSession.state,
          language: lang,
          orderCode: existingSession.state.orderCode ?? resumeOrderCode,
          shortOrderId: existingSession.state.shortOrderId ?? linkedOrder?.shortOrderId ?? null,
          draftOrderId: existingSession.state.draftOrderId ?? resumeOrderId,
        },
        draftOrderId: existingSession.draftOrderId ?? resumeOrderId,
        resumeOrderId,
        resumeOrderCode,
        lastPayloadReferenceId: existingSession.lastPayloadReferenceId ?? null,
        lastStartPayload: null,
      });

      await ctx.reply(formatResumeMessage(lang), { reply_markup: buildResumeKeyboard() });
      return;
    }

    await sessionService.save({
      telegramUserId,
      username,
      currentStep: "home",
      source: "telegram-bot",
      state: { ...existingSession.state, language: lang },
    });

    await ctx.reply(
      formatStartupFallbackMessage(config.NEXT_PUBLIC_SHOP_NAME, lang),
      { reply_markup: buildStartupFallbackKeyboard() },
    );
    return;
  }

  // ── Has payload ────────────────────────────────────────────────────────────
  const parsed = parseStartPayload(payload);

  if (!parsed) {
    await ctx.reply(
      lang === "kh"
        ? "តំណការបញ្ជាទិញនោះមិនត្រឹមត្រូវ។ ចាប់ផ្ដើមការបញ្ជាទិញថ្មី ឬបិទភ្ជាប់លេខសម្គាល់ខ្លី។"
        : "That order link is invalid. Start a new order, paste a short order ID, or contact sales.",
      { reply_markup: buildStartupFallbackKeyboard() },
    );
    return;
  }

  const supportTarget = config.TELEGRAM_SUPPORT_TARGET ?? config.TELEGRAM_ORDER_TARGET;

  try {
    if (parsed.type === "product") {
      const result = await startProductPurchase({ productId: parsed.productId, quantity: parsed.qty, source: "telegram-deeplink" });
      await sessionService.save({
        telegramUserId, username,
        currentStep: "product_preview", source: "telegram-deeplink",
        state: { ...result.state, language: lang }, lastStartPayload: payload,
      });
      await ctx.reply(result.message, { reply_markup: buildProductKeyboard(result.product.id) });
      return;
    }

    if (parsed.type === "reference" || parsed.type === "cart") {
      const result = await startQuickOrderFromReference(parsed.referenceId);
      await sessionService.save({
        telegramUserId, username,
        currentStep: "product_preview", source: "telegram-deeplink",
        state: { ...result.state, language: lang },
        lastPayloadReferenceId: parsed.referenceId, lastStartPayload: payload,
      });
      await ctx.reply(result.message, { reply_markup: buildProductKeyboard(result.product.id) });
      return;
    }

    if (parsed.type === "link") {
      const product = await getProductByLookupKey(parsed.lookupKey);
      if (product) {
        const result = await startProductPurchase({ productId: product.id, source: "telegram-deeplink" });
        await sessionService.save({
          telegramUserId, username,
          currentStep: "product_preview", source: "telegram-deeplink",
          state: { ...result.state, language: lang }, lastStartPayload: payload,
        });
        await ctx.reply(result.message, { reply_markup: buildProductKeyboard(result.product.id) });
        return;
      }

      const categories = await getCatalogCategories();
      await ctx.reply(
        lang === "kh"
          ? `ខ្ញុំរកមិនឃើញតំណនោះទេ។ ជ្រើសប្រភេទ:\n${categories.slice(0, 6).map((c) => c.label).join(", ")}`
          : `I couldn't resolve that link directly. Browse a category instead.\n\nAvailable: ${categories.slice(0, 6).map((c) => c.label).join(", ")}`,
        { reply_markup: buildHomeKeyboard() },
      );
    }

    if (parsed.type === "order") {
      const result = await restoreOrderFlowFromLookup({
        lookup: parsed.shortOrderId,
        telegramUserId,
        telegramUsername: username,
        lang,
      });

      await sessionService.save({
        telegramUserId, username,
        currentStep: result.currentStep, source: "telegram-deeplink",
        state: { ...result.state, language: lang },
        draftOrderId: result.order.id, resumeOrderId: result.order.id,
        resumeOrderCode: result.order.orderCode,
        lastPayloadReferenceId: existingSession.lastPayloadReferenceId ?? null, lastStartPayload: payload,
      });

      await ctx.reply(result.message, {
        reply_markup:
          result.mode === "pending"
            ? buildPendingOrderKeyboard(supportTarget)
            : result.mode === "continuation"
              ? buildOrderContinuationKeyboard()
              : buildOrderReceivedKeyboard(supportTarget),
      });
      return;
    }
  } catch (error) {
    await ctx.reply(
      error instanceof Error ? error.message : (lang === "kh" ? "មានបញ្ហា។ សូមព្យាយាមម្ដងទៀត។" : "Failed to restore that order link."),
      { reply_markup: buildStartupFallbackKeyboard() },
    );
  }
}
