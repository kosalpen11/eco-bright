import type { Bot, Context } from "grammy";
import { getSharedRuntimeConfig } from "../../../../packages/config/src";
import type {
  TelegramSalesPendingAction,
  TelegramSessionLanguage,
} from "../../../../packages/shared/src";
import { parseStartPayload } from "../../../../packages/telegram-core/src";
import { buildLanguageKeyboard } from "../keyboards/order-keyboard";
import {
  buildSalesBackKeyboard,
  buildSalesFallbackKeyboard,
  buildSalesOrderKeyboard,
} from "../keyboards/sales-keyboard";
import {
  buildSalesAcknowledgement,
  buildSalesFallbackMessage,
  buildSalesPromptForAction,
} from "../flows/sales-support-flow";
import { SalesOrderService } from "../services/sales-order-service";
import { formatLanguagePromptMessage } from "../utils/format-message";
import { parsePastedOrder } from "../utils/parse-pasted-order";
import {
  getOrderLookupExample,
  isSupportedOrderLookup,
  normalizeOrderLookupInput,
} from "../../../../src/lib/ordering/order-lookup";

function getLang(session: {
  state: { language?: TelegramSessionLanguage | null };
}): TelegramSessionLanguage {
  return session.state.language === "kh" ? "kh" : "en";
}

function createEmptySalesState(language?: TelegramSessionLanguage | null) {
  return {
    source: "telegram-bot" as const,
    language: language ?? null,
    selectedOrderId: null,
    selectedOrderCode: null,
    selectedShortOrderId: null,
    pendingAction: null,
    lastFreeformMessage: null,
  };
}

function promptForPendingAction(
  action: TelegramSalesPendingAction,
  language: TelegramSessionLanguage,
  input: {
    orderCode?: string | null;
    shortOrderId?: string | null;
  },
) {
  return buildSalesPromptForAction(action, language, input);
}

function actionToStep(action: TelegramSalesPendingAction) {
  switch (action) {
    case "ask_stock":
      return "sales_awaiting_stock_question" as const;
    case "change_fulfillment":
      return "sales_awaiting_fulfillment_change" as const;
    case "add_note":
      return "sales_awaiting_note" as const;
    case "ask_product":
      return "sales_awaiting_product_question" as const;
    case "confirm_details":
      return "sales_order_context" as const;
  }
}

function actionToHistoryAction(action: TelegramSalesPendingAction) {
  switch (action) {
    case "confirm_details":
      return "sales_confirm_details";
    case "ask_stock":
      return "sales_stock_question";
    case "change_fulfillment":
      return "sales_change_fulfillment_request";
    case "add_note":
      return "sales_customer_note";
    case "ask_product":
      return "sales_product_question";
  }
}

async function replyWithSalesContext(input: {
  ctx: Context;
  salesService: SalesOrderService;
  telegramUserId: string;
  username?: string | null;
  lookup?: string | null;
  orderId?: string | null;
  language: TelegramSessionLanguage;
}) {
  const supportContext = await input.salesService.getSupportContext({
    lookup: input.lookup ?? null,
    orderId: input.orderId ?? null,
    telegramUserId: input.telegramUserId,
    telegramUsername: input.username ?? null,
    language: input.language,
  });

  if (!supportContext) {
    await input.ctx.reply(
      input.language === "kh"
        ? `រកមិនឃើញការបញ្ជាទិញ។ សូមបិទភ្ជាប់លេខសម្គាល់ដូចជា ${getOrderLookupExample()}`
        : `Order not found. Paste a short order ID like ${getOrderLookupExample()}.`,
      { reply_markup: buildSalesFallbackKeyboard() },
    );
    return null;
  }

  await input.salesService.saveSession({
    telegramUserId: input.telegramUserId,
    telegramChatId: input.ctx.chat?.id ? String(input.ctx.chat.id) : null,
    username: input.username ?? null,
    currentStep: "sales_order_context",
    state: supportContext.state,
  });

  await input.ctx.reply(supportContext.message, {
    reply_markup: buildSalesOrderKeyboard(),
  });

  return supportContext;
}

export function registerSalesHandlers(bot: Bot, salesService: SalesOrderService) {
  async function showFallback(ctx: Context, language: TelegramSessionLanguage) {
    await ctx.reply(buildSalesFallbackMessage(language), {
      reply_markup: buildSalesFallbackKeyboard(),
    });
  }

  async function handleSalesStart(input: {
    ctx: Context;
    telegramUserId: string;
    username?: string | null;
    payload?: string | null;
    language: TelegramSessionLanguage;
  }) {
    const session = await salesService.getSession(input.telegramUserId);

    if (input.payload) {
      const parsed = parseStartPayload(input.payload);

      if (parsed?.type === "order") {
        await replyWithSalesContext({
          ctx: input.ctx,
          salesService,
          telegramUserId: input.telegramUserId,
          username: input.username ?? null,
          lookup: parsed.shortOrderId,
          language: input.language,
        });
        return;
      }

      await showFallback(input.ctx, input.language);
      return;
    }

    if (session.state.selectedOrderId) {
      await replyWithSalesContext({
        ctx: input.ctx,
        salesService,
        telegramUserId: input.telegramUserId,
        username: input.username ?? null,
        orderId: session.state.selectedOrderId,
        language: input.language,
      });
      return;
    }

    const linkedOrder = await salesService.getLatestLinkedOrder(input.telegramUserId);

    if (linkedOrder) {
      await replyWithSalesContext({
        ctx: input.ctx,
        salesService,
        telegramUserId: input.telegramUserId,
        username: input.username ?? null,
        orderId: linkedOrder.id,
        language: input.language,
      });
      return;
    }

    await salesService.saveSession({
      telegramUserId: input.telegramUserId,
      telegramChatId: input.ctx.chat?.id ? String(input.ctx.chat.id) : null,
      username: input.username ?? null,
      currentStep: "sales_home",
      state: createEmptySalesState(input.language),
    });

    await showFallback(input.ctx, input.language);
  }

  async function handleLanguageSelection(
    ctx: Context,
    salesServiceInput: SalesOrderService,
    selectedLanguage: TelegramSessionLanguage,
  ) {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const telegramUserId = String(ctx.from.id);
    const session = await salesServiceInput.getSession(telegramUserId);
    await salesServiceInput.saveSession({
      telegramUserId,
      telegramChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
      username: ctx.from.username ?? null,
      currentStep: "sales_home",
      state: {
        ...createEmptySalesState(selectedLanguage),
        ...session.state,
        language: selectedLanguage,
      },
      lastStartPayload: session.lastStartPayload ?? null,
    });

    await ctx.answerCallbackQuery();
    await handleSalesStart({
      ctx,
      telegramUserId,
      username: ctx.from.username ?? null,
      payload: session.lastStartPayload ?? undefined,
      language: selectedLanguage,
    });
  }

  bot.command("start", async (ctx) => {
    if (!ctx.from) {
      return;
    }

    const config = getSharedRuntimeConfig();
    const payload = ctx.match?.trim();
    const telegramUserId = String(ctx.from.id);
    const session = await salesService.getSession(telegramUserId);

    if (!session.state.language) {
      await salesService.saveSession({
        telegramUserId,
        telegramChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
        username: ctx.from.username ?? null,
        currentStep: "awaiting_language",
        state: createEmptySalesState(null),
        lastStartPayload: payload ?? session.lastStartPayload ?? null,
      });

      await ctx.reply(formatLanguagePromptMessage(config.NEXT_PUBLIC_SHOP_NAME), {
        reply_markup: buildLanguageKeyboard(),
      });
      return;
    }

    await handleSalesStart({
      ctx,
      telegramUserId,
      username: ctx.from.username ?? null,
      payload,
      language: getLang(session),
    });
  });

  bot.command("sales", async (ctx) => {
    if (!ctx.from) {
      return;
    }

    const config = getSharedRuntimeConfig();
    const session = await salesService.getSession(String(ctx.from.id));

    if (!session.state.language) {
      await salesService.saveSession({
        telegramUserId: String(ctx.from.id),
        telegramChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
        username: ctx.from.username ?? null,
        currentStep: "awaiting_language",
        state: createEmptySalesState(null),
      });

      await ctx.reply(formatLanguagePromptMessage(config.NEXT_PUBLIC_SHOP_NAME), {
        reply_markup: buildLanguageKeyboard(),
      });
      return;
    }

    await handleSalesStart({
      ctx,
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      language: getLang(session),
    });
  });

  bot.callbackQuery("lang:kh", async (ctx) => {
    await handleLanguageSelection(ctx, salesService, "kh");
  });

  bot.callbackQuery("lang:en", async (ctx) => {
    await handleLanguageSelection(ctx, salesService, "en");
  });

  bot.callbackQuery("sales:back", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const session = await salesService.getSession(String(ctx.from.id));
    const language = getLang(session);
    await ctx.answerCallbackQuery();

    if (session.state.selectedOrderId) {
      await replyWithSalesContext({
        ctx,
        salesService,
        telegramUserId: String(ctx.from.id),
        username: ctx.from.username ?? null,
        orderId: session.state.selectedOrderId,
        language,
      });
      return;
    }

    await showFallback(ctx, language);
  });

  bot.callbackQuery("sales:paste-order-id", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const session = await salesService.getSession(String(ctx.from.id));
    const language = getLang(session);
    await salesService.saveSession({
      telegramUserId: String(ctx.from.id),
      telegramChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
      username: ctx.from.username ?? null,
      currentStep: "sales_awaiting_order_lookup",
      state: {
        ...session.state,
        language,
        pendingAction: null,
      },
    });
    await ctx.answerCallbackQuery();
    await ctx.reply(
      language === "kh"
        ? `បិទភ្ជាប់លេខសម្គាល់ការបញ្ជាទិញ។ ឧទាហរណ៍: ${getOrderLookupExample()}`
        : `Paste the order ID now. Example: ${getOrderLookupExample()}`,
      { reply_markup: buildSalesBackKeyboard() },
    );
  });

  bot.callbackQuery("sales:paste-order-text", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const session = await salesService.getSession(String(ctx.from.id));
    const language = getLang(session);
    await salesService.saveSession({
      telegramUserId: String(ctx.from.id),
      telegramChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
      username: ctx.from.username ?? null,
      currentStep: "sales_awaiting_order_text",
      state: {
        ...session.state,
        language,
        pendingAction: null,
      },
    });
    await ctx.answerCallbackQuery();
    await ctx.reply(
      language === "kh"
        ? "បិទភ្ជាប់អត្ថបទការបញ្ជាទិញ ឬសារដែលមានលេខ Order ID។"
        : "Paste the order text or any message that contains the Order ID.",
      { reply_markup: buildSalesBackKeyboard() },
    );
  });

  bot.callbackQuery("sales:ask-product", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const session = await salesService.getSession(String(ctx.from.id));
    const language = getLang(session);
    await salesService.saveSession({
      telegramUserId: String(ctx.from.id),
      telegramChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
      username: ctx.from.username ?? null,
      currentStep: "sales_awaiting_product_question",
      state: {
        ...session.state,
        language,
        pendingAction: "ask_product",
      },
    });
    await ctx.answerCallbackQuery();
    await ctx.reply(promptForPendingAction("ask_product", language, {}), {
      reply_markup: buildSalesBackKeyboard(),
    });
  });

  bot.callbackQuery("sales:human", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const session = await salesService.getSession(String(ctx.from.id));
    const language = getLang(session);
    await ctx.answerCallbackQuery();
    await ctx.reply(
      language === "kh"
        ? "ក្រុមផ្នែកលក់នឹងបន្តជាមួយអ្នកក្នុងជជែកនេះឆាប់ៗ។"
        : "A sales teammate will continue with you in this chat shortly.",
      {
        reply_markup: session.state.selectedOrderId
          ? buildSalesOrderKeyboard()
          : buildSalesFallbackKeyboard(),
      },
    );
  });

  bot.callbackQuery("sales:cancel", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const session = await salesService.getSession(String(ctx.from.id));
    const language = getLang(session);
    await salesService.saveSession({
      telegramUserId: String(ctx.from.id),
      telegramChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
      username: ctx.from.username ?? null,
      currentStep: "sales_home",
      state: createEmptySalesState(language),
    });

    await ctx.answerCallbackQuery();
    await showFallback(ctx, language);
  });

  for (const action of ["confirm_details", "ask_stock", "change_fulfillment", "add_note"] as const) {
    const callback =
      action === "confirm_details"
        ? "sales:confirm-details"
        : action === "ask_stock"
        ? "sales:ask-stock"
        : action === "change_fulfillment"
        ? "sales:change-fulfillment"
        : "sales:add-note";

    bot.callbackQuery(callback, async (ctx) => {
      if (!ctx.from) {
        await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
        return;
      }

      const session = await salesService.getSession(String(ctx.from.id));
      const language = getLang(session);

      if (!session.state.selectedOrderId) {
        await ctx.answerCallbackQuery({
          text: language === "kh" ? "រកមិនឃើញការបញ្ជាទិញ។" : "No order context found.",
        });
        await showFallback(ctx, language);
        return;
      }

      if (action === "confirm_details") {
        await salesService.logSalesAction({
          orderId: session.state.selectedOrderId,
          action: actionToHistoryAction(action),
          actorId: String(ctx.from.id),
          actorName: ctx.from.username ?? null,
          reason: "Customer confirmed details in sales bot.",
        });

        await ctx.answerCallbackQuery();
        await ctx.reply(
          buildSalesAcknowledgement(action, language, {
            orderCode: session.state.selectedOrderCode,
            shortOrderId: session.state.selectedShortOrderId,
          }),
          { reply_markup: buildSalesOrderKeyboard() },
        );
        return;
      }

      await salesService.setPendingAction({
        telegramUserId: String(ctx.from.id),
        telegramChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
        username: ctx.from.username ?? null,
        language,
        orderId: session.state.selectedOrderId,
        orderCode: session.state.selectedOrderCode,
        shortOrderId: session.state.selectedShortOrderId,
        pendingAction: action,
        currentStep: actionToStep(action),
      });

      await ctx.answerCallbackQuery();
      await ctx.reply(
        promptForPendingAction(action, language, {
          orderCode: session.state.selectedOrderCode,
          shortOrderId: session.state.selectedShortOrderId,
        }),
        { reply_markup: buildSalesBackKeyboard() },
      );
    });
  }

  bot.on("message:text", async (ctx, next) => {
    if (!ctx.from) {
      await next();
      return;
    }

    const telegramUserId = String(ctx.from.id);
    const session = await salesService.getSession(telegramUserId);
    const language = getLang(session);
    const text = ctx.message.text.trim();

    if (session.currentStep === "sales_awaiting_order_lookup") {
      const lookup = normalizeOrderLookupInput(text);

      if (!lookup || !isSupportedOrderLookup(lookup)) {
        await ctx.reply(
          language === "kh"
            ? `លេខសម្គាល់មិនត្រឹមត្រូវ។ សូមប្រើ ${getOrderLookupExample()}`
            : `That order ID is not valid. Use ${getOrderLookupExample()}.`,
          { reply_markup: buildSalesBackKeyboard() },
        );
        return;
      }

      await replyWithSalesContext({
        ctx,
        salesService,
        telegramUserId,
        username: ctx.from.username ?? null,
        lookup,
        language,
      });
      return;
    }

    if (session.currentStep === "sales_awaiting_order_text") {
      const parsed = parsePastedOrder(text);

      if (!parsed) {
        await ctx.reply(
          language === "kh"
            ? "ខ្ញុំរកមិនឃើញលេខសម្គាល់ការបញ្ជាទិញក្នុងអត្ថបទនោះទេ។"
            : "I couldn't find an order ID in that text.",
          { reply_markup: buildSalesBackKeyboard() },
        );
        return;
      }

      const lookup = normalizeOrderLookupInput(parsed.rawOrderId);
      if (!lookup) {
        await ctx.reply(
          language === "kh"
            ? "លេខសម្គាល់ការបញ្ជាទិញមិនត្រឹមត្រូវ។"
            : "That order ID could not be parsed.",
          { reply_markup: buildSalesBackKeyboard() },
        );
        return;
      }

      await replyWithSalesContext({
        ctx,
        salesService,
        telegramUserId,
        username: ctx.from.username ?? null,
        lookup,
        language,
      });
      return;
    }

    if (
      session.currentStep === "sales_awaiting_product_question" ||
      session.currentStep === "sales_awaiting_stock_question" ||
      session.currentStep === "sales_awaiting_fulfillment_change" ||
      session.currentStep === "sales_awaiting_note"
    ) {
      const pendingAction =
        session.state.pendingAction ??
        (session.currentStep === "sales_awaiting_product_question"
          ? "ask_product"
          : session.currentStep === "sales_awaiting_stock_question"
          ? "ask_stock"
          : session.currentStep === "sales_awaiting_fulfillment_change"
          ? "change_fulfillment"
          : "add_note");

      if (session.state.selectedOrderId) {
        await salesService.logSalesAction({
          orderId: session.state.selectedOrderId,
          action: actionToHistoryAction(pendingAction),
          actorId: telegramUserId,
          actorName: ctx.from.username ?? null,
          reason: text,
        });
      }

      await salesService.saveSession({
        telegramUserId,
        telegramChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
        username: ctx.from.username ?? null,
        currentStep: session.state.selectedOrderId ? "sales_order_context" : "sales_home",
        state: {
          ...session.state,
          language,
          pendingAction: null,
          lastFreeformMessage: text,
        },
      });

      await ctx.reply(
        buildSalesAcknowledgement(pendingAction, language, {
          orderCode: session.state.selectedOrderCode,
          shortOrderId: session.state.selectedShortOrderId,
        }),
        {
          reply_markup: session.state.selectedOrderId
            ? buildSalesOrderKeyboard()
            : buildSalesFallbackKeyboard(),
        },
      );
      return;
    }

    await next();
  });
}
