import { InlineKeyboard, type Bot } from "grammy";
import { searchCatalogProducts } from "../../../../packages/catalog-core/src";
import { getSharedRuntimeConfig } from "../../../../packages/config/src";
import {
  applyOrderStatusUpdate,
  getOrderById,
  getLatestResumableOrderForTelegramUser,
  getOrderWithItemsById,
  listOrdersForTelegramCustomer,
} from "../../../../src/db/queries/orders";
import {
  getOrderLookupExample,
  isSupportedOrderLookup,
  normalizeOrderLookupInput,
} from "../../../../src/lib/ordering/order-lookup";
import { getProductById, getProductByLookupKey } from "../../../../src/db/queries/products";
import {
  buildCancelKeyboard,
  buildHomeKeyboard,
  buildMainMenuOnlyKeyboard,
} from "../keyboards/common-keyboard";
import {
  buildCartKeyboard,
  buildCheckoutKeyboard,
  buildOrderContinuationKeyboard,
  buildOrderReceivedKeyboard,
  buildOrderSuccessKeyboard,
  buildPendingOrderKeyboard,
  buildReviewKeyboard,
  buildSkipKeyboard,
} from "../keyboards/order-keyboard";
import { buildProductKeyboard, buildQuantityKeyboard } from "../keyboards/product-keyboard";
import {
  finalizePurchaseFromState,
  prepareReviewFromState,
  startProductPurchase,
} from "../flows/purchase-flow";
import { startPastedLinkOrder } from "../flows/pasted-link-flow";
import { restoreOrderFlowFromLookup, restoreOrderFlowFromOrderId } from "../flows/order-modification-flow";
import { TelegramSessionService } from "../services/telegram-session-service";
import type { BotLang } from "../utils/format-message";
import {
  formatCartMessage,
  formatOrdersListMessage,
  formatOrderCreatedMessage,
  formatPasteOrderCodePrompt,
  formatPasteLinkPrompt,
  formatSearchPrompt,
  formatWelcomeMessage,
} from "../utils/format-message";
import { parsePastedOrder } from "../utils/parse-pasted-order";

function createEmptyPurchaseState() {
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

function buildSearchResultsKeyboard(products: Awaited<ReturnType<typeof searchCatalogProducts>>) {
  const keyboard = new InlineKeyboard();

  for (const product of products.slice(0, 8)) {
    keyboard.text(product.title, `preview:${product.id}`).row();
  }

  return keyboard.text("Main Menu", "menu:home");
}

async function replyWithRestoredOrder(input: {
  botUserId: string;
  username?: string | null;
  supportTarget: string;
  lang?: BotLang;
  orderId?: string | null;
  lookup?: string | null;
  sessionService: TelegramSessionService;
  reply: (message: string, extra: { reply_markup: InlineKeyboard }) => Promise<unknown>;
}) {
  const lang = input.lang ?? "en";
  const restored =
    input.orderId
      ? await restoreOrderFlowFromOrderId({
          orderId: input.orderId,
          telegramUserId: input.botUserId,
          telegramUsername: input.username ?? null,
          lang,
        })
      : await restoreOrderFlowFromLookup({
          lookup: input.lookup ?? "",
          telegramUserId: input.botUserId,
          telegramUsername: input.username ?? null,
          lang,
        });

  await input.sessionService.save({
    telegramUserId: input.botUserId,
    username: input.username ?? null,
    currentStep: restored.currentStep,
    source: restored.state.source,
    state: restored.state,
    draftOrderId: restored.order.id,
    resumeOrderId: restored.order.id,
    resumeOrderCode: restored.order.orderCode,
  });

  await input.reply(restored.message, {
    reply_markup:
      restored.mode === "pending"
        ? buildPendingOrderKeyboard(input.supportTarget)
        : restored.mode === "continuation"
        ? buildOrderContinuationKeyboard()
        : buildOrderReceivedKeyboard(input.supportTarget),
  });

  return restored;
}

export function registerOrderHandlers(bot: Bot, sessionService: TelegramSessionService) {
  async function showHomeMenu(input: {
    telegramUserId: string;
    username?: string | null;
    preserveState?: boolean;
  }) {
    const config = getSharedRuntimeConfig();
    const existing = input.preserveState
      ? await sessionService.getState(input.telegramUserId)
      : null;

    await sessionService.save({
      telegramUserId: input.telegramUserId,
      username: input.username ?? null,
      currentStep: "home",
      source: existing?.state.source ?? "telegram-bot",
      state: existing?.state ?? createEmptyPurchaseState(),
      draftOrderId: existing?.draftOrderId ?? existing?.state.draftOrderId ?? null,
      lastPayloadReferenceId: existing?.lastPayloadReferenceId ?? null,
    });

    return {
      text: formatWelcomeMessage({
        shopName: config.NEXT_PUBLIC_SHOP_NAME,
        salesTarget: config.TELEGRAM_SUPPORT_TARGET ?? config.TELEGRAM_ORDER_TARGET,
      }),
      keyboard: buildHomeKeyboard(),
    };
  }

  async function buildCartPreview(state: Awaited<ReturnType<TelegramSessionService["getState"]>>["state"]) {
    const items = await Promise.all(
      state.items.map(async (item) => {
        const product = await getProductById(item.productId);

        return {
          title: product?.title ?? item.productId,
          qty: item.qty,
          price: product?.price ?? 0,
          lineTotal: (product?.price ?? 0) * item.qty,
        };
      }),
    );

    return {
      text: formatCartMessage({
        shopName: "ECO BRIGHT LED & SOLAR",
        currency: "USD",
        items,
        total: items.reduce((sum, item) => sum + item.lineTotal, 0),
      }),
      hasItems: items.length > 0,
    };
  }

  async function moveToReviewStep(input: {
    telegramUserId: string;
    username?: string | null;
    chatId?: string | null;
    state: Awaited<ReturnType<TelegramSessionService["getState"]>>["state"];
  }) {
    const config = getSharedRuntimeConfig();
    const prepared = await prepareReviewFromState({
      shop: config.NEXT_PUBLIC_SHOP_NAME,
      state: input.state,
      telegramIdentity: {
        telegramUserId: input.telegramUserId,
        telegramUsername: input.username ?? null,
        telegramChatId: input.chatId ?? null,
      },
    });

    await sessionService.save({
      telegramUserId: input.telegramUserId,
      username: input.username ?? null,
      currentStep: "review",
      source: prepared.state.source,
      state: prepared.state,
      draftOrderId: prepared.draftOrder.id,
    });

    return prepared;
  }

  async function beginCheckout(input: {
    telegramUserId: string;
    username?: string | null;
    chatId?: string | null;
    session: Awaited<ReturnType<TelegramSessionService["getState"]>>;
  }) {
    if (!input.session.state.items.length) {
      return {
        text: "Your cart is empty.\nAdd products first, then come back to checkout.",
        keyboard: buildHomeKeyboard(),
      };
    }

    if (!input.session.state.fulfillmentMethod) {
      await sessionService.save({
        telegramUserId: input.telegramUserId,
        username: input.username ?? null,
        currentStep: "awaiting_fulfillment",
        source: input.session.state.source,
        state: input.session.state,
        draftOrderId: input.session.draftOrderId ?? null,
        lastPayloadReferenceId: input.session.lastPayloadReferenceId ?? null,
      });

      return {
        text: "Choose how you want to receive your order.",
        keyboard: buildCheckoutKeyboard(),
      };
    }

    if (!input.session.state.customerPhone) {
      await sessionService.save({
        telegramUserId: input.telegramUserId,
        username: input.username ?? null,
        currentStep: "awaiting_phone",
        source: input.session.state.source,
        state: input.session.state,
        draftOrderId: input.session.draftOrderId ?? null,
        lastPayloadReferenceId: input.session.lastPayloadReferenceId ?? null,
      });

      return {
        text: "Send your phone number so we can confirm the order.",
        keyboard: buildCancelKeyboard(),
      };
    }

    await moveToReviewStep({
      telegramUserId: input.telegramUserId,
      username: input.username ?? null,
      chatId: input.chatId ?? null,
      state: input.session.state,
    });

    return {
      text: "Please review your order before confirming.",
      keyboard: buildReviewKeyboard(),
    };
  }

  bot.callbackQuery("menu:home", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const menu = await showHomeMenu({
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      preserveState: true,
    });

    await ctx.answerCallbackQuery();
    await ctx.reply(menu.text, { reply_markup: menu.keyboard });
  });

  bot.callbackQuery("menu:shop", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("Choose a category.", {
      reply_markup: new InlineKeyboard()
        .text("Browse Categories", "browse:categories")
        .row()
        .text("Search Product", "menu:search")
        .text("Paste Product Link", "menu:paste-link")
        .row()
        .text("Main Menu", "menu:home"),
    });
  });

  bot.callbackQuery("menu:search", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const session = await sessionService.getState(String(ctx.from.id));
    await sessionService.save({
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      currentStep: "awaiting_search",
      source: session.state.source,
      state: session.state,
      draftOrderId: session.draftOrderId ?? null,
      lastPayloadReferenceId: session.lastPayloadReferenceId ?? null,
    });

    await ctx.answerCallbackQuery();
    await ctx.reply(formatSearchPrompt(), {
      reply_markup: buildMainMenuOnlyKeyboard(),
    });
  });

  bot.callbackQuery("menu:paste-link", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const session = await sessionService.getState(String(ctx.from.id));
    await sessionService.save({
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      currentStep: "awaiting_pasted_link",
      source: session.state.source,
      state: session.state,
      draftOrderId: session.draftOrderId ?? null,
      lastPayloadReferenceId: session.lastPayloadReferenceId ?? null,
    });

    await ctx.answerCallbackQuery();
    await ctx.reply(formatPasteLinkPrompt(), {
      reply_markup: buildMainMenuOnlyKeyboard(),
    });
  });

  bot.callbackQuery("cart:view", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const session = await sessionService.getState(String(ctx.from.id));
    const preview = await buildCartPreview(session.state);

    await sessionService.save({
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      currentStep: "cart_preview",
      source: session.state.source,
      state: session.state,
      draftOrderId: session.draftOrderId ?? null,
      lastPayloadReferenceId: session.lastPayloadReferenceId ?? null,
    });

    await ctx.answerCallbackQuery();
    await ctx.reply(preview.text, {
      reply_markup: preview.hasItems ? buildCartKeyboard() : buildHomeKeyboard(),
    });
  });

  bot.callbackQuery("cart:clear", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const menu = await showHomeMenu({
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      preserveState: false,
    });

    await ctx.answerCallbackQuery({ text: "Cart cleared." });
    await ctx.reply("Cart cleared.", { reply_markup: menu.keyboard });
  });

  bot.callbackQuery("cart:checkout", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const session = await sessionService.getState(String(ctx.from.id));
    const checkout = await beginCheckout({
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      chatId: ctx.chat?.id ? String(ctx.chat.id) : null,
      session,
    });

    await ctx.answerCallbackQuery();
    await ctx.reply(checkout.text, { reply_markup: checkout.keyboard });
  });

  bot.callbackQuery("orders:list", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const orders = await listOrdersForTelegramCustomer(String(ctx.from.id), 5);

    await ctx.answerCallbackQuery();
    await ctx.reply(
      formatOrdersListMessage({
        shopName: "ECO BRIGHT LED & SOLAR",
        orders: orders.map((order) => ({
          shortOrderId: order.orderCode ?? order.shortOrderId,
          invoiceId: order.invoiceId,
          status: order.status,
          total: order.total,
          currency: order.currency,
        })),
      }),
      { reply_markup: buildMainMenuOnlyKeyboard() },
    );
  });

  bot.callbackQuery(/^order:fulfillment:(pickup|delivery)$/i, async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const fulfillmentMethod = ctx.match[1] as "pickup" | "delivery";
    const session = await sessionService.getState(String(ctx.from.id));
    const nextState = {
      ...session.state,
      fulfillmentMethod,
    };

    await sessionService.save({
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      currentStep: "awaiting_phone",
      source: nextState.source,
      state: nextState,
      draftOrderId: session.draftOrderId ?? null,
      lastPayloadReferenceId: session.lastPayloadReferenceId ?? null,
    });

    await ctx.answerCallbackQuery();
    await ctx.reply("Send your phone number so we can confirm the order.", {
      reply_markup: buildCancelKeyboard(),
    });
  });

  bot.callbackQuery("order:summary", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const session = await sessionService.getState(String(ctx.from.id));
    const orderId = session.draftOrderId ?? session.state.draftOrderId;

    if (!orderId) {
      await ctx.answerCallbackQuery({ text: "No saved order summary found." });
      return;
    }

    const order = await getOrderWithItemsById(orderId);

    if (!order) {
      await ctx.answerCallbackQuery({ text: "Order summary not found." });
      return;
    }

    await ctx.answerCallbackQuery();
    await ctx.reply(
      [
        `Short Order ID: ${order.order.orderCode ?? order.order.shortOrderId ?? order.order.id}`,
        `Invoice ID: ${order.order.invoiceId}`,
        "",
        ...order.items.flatMap((item) => [
          `• ${item.title}`,
          `  ${item.qty} × ${item.price.toFixed(2)} ${order.order.currency}`,
          `  Line total: ${item.lineTotal.toFixed(2)} ${order.order.currency}`,
        ]),
        "",
        `Total: ${order.order.total.toFixed(2)} ${order.order.currency}`,
      ].join("\n"),
      { reply_markup: buildOrderSuccessKeyboard() },
    );
  });

  bot.callbackQuery(/^order:qty:(\d+)$/i, async (ctx) => {
    const qty = Number(ctx.match[1]);
    const session = await sessionService.getState(String(ctx.from.id));

    if (!session.state.currentProductId || !session.state.items.length) {
      await ctx.answerCallbackQuery({ text: "Start with a product first." });
      return;
    }

    const nextState = {
      ...session.state,
      items: session.state.items.map((item) =>
        item.productId === session.state.currentProductId ? { ...item, qty } : item,
      ),
    };

    await sessionService.save({
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      currentStep: "awaiting_phone",
      source: nextState.source,
      state: nextState,
      draftOrderId: session.draftOrderId ?? null,
      lastPayloadReferenceId: session.lastPayloadReferenceId ?? null,
    });

    await ctx.answerCallbackQuery();
    await ctx.reply("Send your phone number so we can confirm the order.", {
      reply_markup: buildCancelKeyboard(),
    });
  });

  bot.callbackQuery("resume:order", async (ctx) => {
    const session = await sessionService.getState(String(ctx.from.id));
    const config = getSharedRuntimeConfig();
    const supportTarget = config.TELEGRAM_SUPPORT_TARGET ?? config.TELEGRAM_ORDER_TARGET;

    await ctx.answerCallbackQuery();

    if (
      session.currentStep === "idle" ||
      session.currentStep === "home" ||
      session.currentStep === "completed"
    ) {
      const resumeOrderId =
        session.resumeOrderId ??
        session.draftOrderId ??
        session.state.draftOrderId ??
        (await getLatestResumableOrderForTelegramUser(String(ctx.from.id)))?.id ??
        null;

      if (resumeOrderId) {
        await replyWithRestoredOrder({
          botUserId: String(ctx.from.id),
          username: ctx.from.username ?? null,
          supportTarget,
          orderId: resumeOrderId,
          sessionService,
          reply: (message, extra) => ctx.reply(message, extra),
        });
        return;
      }
    }

    switch (session.currentStep) {
      case "product_preview":
        await ctx.reply("Choose a quantity to continue:", {
          reply_markup: buildQuantityKeyboard(),
        });
        return;
      case "cart_preview": {
        const preview = await buildCartPreview(session.state);
        await ctx.reply(preview.text, {
          reply_markup: preview.hasItems ? buildCartKeyboard() : buildHomeKeyboard(),
        });
        return;
      }
      case "awaiting_search":
        await ctx.reply(formatSearchPrompt(), { reply_markup: buildMainMenuOnlyKeyboard() });
        return;
      case "awaiting_pasted_link":
        await ctx.reply(formatPasteLinkPrompt(), { reply_markup: buildMainMenuOnlyKeyboard() });
        return;
      case "awaiting_order_code":
        await ctx.reply(formatPasteOrderCodePrompt(), {
          reply_markup: buildMainMenuOnlyKeyboard(),
        });
        return;
      case "awaiting_fulfillment":
        await ctx.reply("Choose how you want to receive your order.", {
          reply_markup: buildCheckoutKeyboard(),
        });
        return;
      case "awaiting_phone":
        await ctx.reply("Send your phone number so we can confirm the order.", {
          reply_markup: buildCancelKeyboard(),
        });
        return;
      case "awaiting_name":
        await ctx.reply("Send your name, or skip if you want to continue without it.", {
          reply_markup: buildSkipKeyboard("name"),
        });
        return;
      case "awaiting_note":
        await ctx.reply("Add an order note, or skip if not needed.", {
          reply_markup: buildSkipKeyboard("note"),
        });
        return;
      case "review":
        await ctx.reply("Please review your order before confirming.", {
          reply_markup: buildReviewKeyboard(),
        });
        return;
      default:
        await ctx.reply("There is no active order to resume right now. Paste a short order ID instead.", {
          reply_markup: buildMainMenuOnlyKeyboard(),
        });
    }
  });

  bot.callbackQuery("order:add-note", async (ctx) => {
    const session = await sessionService.getState(String(ctx.from.id));

    await sessionService.save({
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      currentStep: "awaiting_note",
      source: session.state.source,
      state: session.state,
      draftOrderId: session.draftOrderId ?? null,
      lastPayloadReferenceId: session.lastPayloadReferenceId ?? null,
    });

    await ctx.answerCallbackQuery();
    await ctx.reply("Add an order note, or skip if not needed.", {
      reply_markup: buildSkipKeyboard("note"),
    });
  });

  bot.callbackQuery(/^order:skip:(name|note)$/i, async (ctx) => {
    const session = await sessionService.getState(String(ctx.from.id));
    await moveToReviewStep({
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      chatId: ctx.chat?.id ? String(ctx.chat.id) : null,
      state: session.state,
    });

    await ctx.answerCallbackQuery();

    await ctx.reply("Please review your order before confirming.", {
      reply_markup: buildReviewKeyboard(),
    });
  });

  bot.callbackQuery("order:confirm", async (ctx) => {
    const config = getSharedRuntimeConfig();
    const supportTarget = config.TELEGRAM_SUPPORT_TARGET ?? config.TELEGRAM_ORDER_TARGET;
    const session = await sessionService.getState(String(ctx.from.id));
    const prepared =
      session.draftOrderId
        ? {
            draftOrder: { id: session.draftOrderId },
            state: {
              ...session.state,
              draftOrderId: session.draftOrderId,
            },
          }
        : await moveToReviewStep({
            telegramUserId: String(ctx.from.id),
            username: ctx.from.username ?? null,
            chatId: ctx.chat?.id ? String(ctx.chat.id) : null,
            state: session.state,
          });

    const completed = await finalizePurchaseFromState({
      orderId: prepared.draftOrder.id,
      state: prepared.state,
      telegramIdentity: {
        telegramUserId: String(ctx.from.id),
        telegramUsername: ctx.from.username ?? null,
        telegramChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
      },
    });

    await sessionService.save({
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      currentStep: "completed",
      source: session.state.source,
      state: {
        ...prepared.state,
        draftOrderId: completed.order.id,
      },
      draftOrderId: completed.order.id,
    });

    await ctx.answerCallbackQuery();
    await ctx.reply(formatOrderCreatedMessage(), {
      reply_markup: buildOrderReceivedKeyboard(supportTarget),
    });
    await ctx.reply(completed.summaryMessage, {
      reply_markup: buildOrderReceivedKeyboard(supportTarget),
    });
  });

  bot.callbackQuery("order:cancel", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const session = await sessionService.getState(String(ctx.from.id));
    const savedOrderId = session.draftOrderId ?? session.state.draftOrderId ?? null;

    if (savedOrderId) {
      const order = await getOrderById(savedOrderId);

      if (order && (order.status === "draft" || order.status === "pending")) {
        await applyOrderStatusUpdate({
          orderId: savedOrderId,
          nextStatus: "cancelled",
          action: "customer_cancel",
          actorType: "customer",
          actorId: String(ctx.from.id),
          actorName: ctx.from.username ?? null,
          reason: "Cancelled by customer from Telegram continuation",
        });
      }
    }

    const menu = await showHomeMenu({
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      preserveState: false,
    });

    await ctx.answerCallbackQuery();
    await ctx.reply(savedOrderId ? "Your order was cancelled." : "Order flow cancelled.", {
      reply_markup: menu.keyboard,
    });
  });

  bot.callbackQuery(/^order:product:(.+)$/i, async (ctx) => {
    const productId = ctx.match[1];
    const session = await sessionService.getState(String(ctx.from.id));
    const nextState = {
      ...session.state,
      currentProductId: productId,
      items: session.state.items.some((item) => item.productId === productId)
        ? session.state.items
        : [...session.state.items, { productId, qty: 1 }],
    };

    await sessionService.save({
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      currentStep: "awaiting_quantity",
      source: nextState.source,
      state: nextState,
      draftOrderId: session.draftOrderId ?? null,
      lastPayloadReferenceId: session.lastPayloadReferenceId ?? null,
    });

    await ctx.answerCallbackQuery();
    await ctx.reply("Choose a quantity to continue:", {
      reply_markup: buildQuantityKeyboard(),
    });
  });

  bot.on("message:text", async (ctx, next) => {
    const text = ctx.message.text.trim();
    const session = await sessionService.getState(String(ctx.from.id));

    if (session.currentStep === "awaiting_search") {
      const results = await searchCatalogProducts({ query: text });

      if (!results.length) {
        await ctx.reply("No products matched that search. Try a different keyword.", {
          reply_markup: buildMainMenuOnlyKeyboard(),
        });
        return;
      }

      await ctx.reply("Choose a product:", {
        reply_markup: buildSearchResultsKeyboard(results),
      });
      return;
    }

    if (session.currentStep === "awaiting_pasted_link") {
      try {
        const result = await startPastedLinkOrder(text);

        await sessionService.save({
          telegramUserId: String(ctx.from.id),
          username: ctx.from.username ?? null,
          currentStep: "product_preview",
          source: result.state.source,
          state: {
            ...result.state,
            lastResolvedLink: text,
          },
        });

        await ctx.reply(result.message, {
          reply_markup: buildProductKeyboard(result.product.id),
        });
      } catch (error) {
        await ctx.reply(
          error instanceof Error
            ? error.message
            : "That link could not be resolved. Try another product link.",
          { reply_markup: buildMainMenuOnlyKeyboard() },
        );
      }
      return;
    }

    if (session.currentStep === "awaiting_order_code") {
      const normalizedLookup = normalizeOrderLookupInput(text);

      if (!normalizedLookup || !isSupportedOrderLookup(normalizedLookup)) {
        await ctx.reply(
          `That short order ID is not valid. Paste a code like ${getOrderLookupExample()}.`,
          { reply_markup: buildMainMenuOnlyKeyboard() },
        );
        return;
      }

      try {
        const config = getSharedRuntimeConfig();
        const supportTarget = config.TELEGRAM_SUPPORT_TARGET ?? config.TELEGRAM_ORDER_TARGET;

        await replyWithRestoredOrder({
          botUserId: String(ctx.from.id),
          username: ctx.from.username ?? null,
          supportTarget,
          lookup: normalizedLookup,
          sessionService,
          reply: (message, extra) => ctx.reply(message, extra),
        });
      } catch (error) {
        await ctx.reply(
          error instanceof Error
            ? error.message
            : "That short order ID could not be restored.",
          { reply_markup: buildMainMenuOnlyKeyboard() },
        );
      }
      return;
    }

    if (session.currentStep === "awaiting_phone") {
      const nextState = {
        ...session.state,
        customerPhone: text,
      };

      await sessionService.save({
        telegramUserId: String(ctx.from.id),
        username: ctx.from.username ?? null,
        currentStep: "awaiting_name",
        source: nextState.source,
        state: nextState,
      });

      await ctx.reply("Send your name, or skip if you want to continue without it.", {
        reply_markup: buildSkipKeyboard("name"),
      });
      return;
    }

    if (session.currentStep === "awaiting_name") {
      const nextState = {
        ...session.state,
        customerName: text,
      };
      await moveToReviewStep({
        telegramUserId: String(ctx.from.id),
        username: ctx.from.username ?? null,
        chatId: ctx.chat?.id ? String(ctx.chat.id) : null,
        state: nextState,
      });

      await ctx.reply("Please review your order before confirming.", {
        reply_markup: buildReviewKeyboard(),
      });
      return;
    }

    if (session.currentStep === "awaiting_note") {
      const nextState = {
        ...session.state,
        note: text,
      };
      await moveToReviewStep({
        telegramUserId: String(ctx.from.id),
        username: ctx.from.username ?? null,
        chatId: ctx.chat?.id ? String(ctx.chat.id) : null,
        state: nextState,
      });

      await ctx.reply("Please review your order before confirming.", {
        reply_markup: buildReviewKeyboard(),
      });
      return;
    }

    if (/^https?:\/\//i.test(text)) {
      try {
        const result = await startPastedLinkOrder(text);

        await sessionService.save({
          telegramUserId: String(ctx.from.id),
          username: ctx.from.username ?? null,
          currentStep: "product_preview",
          source: result.state.source,
          state: {
            ...result.state,
            lastResolvedLink: text,
          },
        });

        await ctx.reply(result.message, {
          reply_markup: buildProductKeyboard(result.product.id),
        });
        return;
      } catch {
        // Fall through to the normal message chain.
      }
    }

    const directProduct = await getProductByLookupKey(text);

    if (directProduct) {
      const result = await startProductPurchase({
        productId: directProduct.id,
        source: "telegram-bot",
      });

      await sessionService.save({
        telegramUserId: String(ctx.from.id),
        username: ctx.from.username ?? null,
        currentStep: "product_preview",
        source: result.state.source,
        state: {
          ...session.state,
          ...result.state,
        },
      });

      await ctx.reply(result.message, {
        reply_markup: buildProductKeyboard(result.product.id),
      });
      return;
    }

    const pastedOrder = parsePastedOrder(text);
    if (pastedOrder) {
      try {
        const config = getSharedRuntimeConfig();
        const supportTarget = config.TELEGRAM_SUPPORT_TARGET ?? config.TELEGRAM_ORDER_TARGET;

        await replyWithRestoredOrder({
          botUserId: String(ctx.from.id),
          username: ctx.from.username ?? null,
          supportTarget,
          lookup: pastedOrder.rawOrderId,
          lang: getLang(session),
          sessionService,
          reply: (message, extra) => ctx.reply(message, extra),
        });
        return;
      } catch {
        // Fall through if order couldn't be restored
      }
    }

    await next();
  });
}
