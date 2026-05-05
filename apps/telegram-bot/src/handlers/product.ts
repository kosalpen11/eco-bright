import type { Bot } from "grammy";
import { buildCartKeyboard } from "../keyboards/order-keyboard";
import { buildProductKeyboard } from "../keyboards/product-keyboard";
import { startProductPurchase } from "../flows/purchase-flow";
import { TelegramSessionService } from "../services/telegram-session-service";
import { formatCartMessage } from "../utils/format-message";
import { getProductById } from "../../../../src/db/queries/products";

export function registerProductHandlers(bot: Bot, sessionService: TelegramSessionService) {
  bot.callbackQuery(/^preview:(.+)$/i, async (ctx) => {
    const productId = ctx.match[1];
    const result = await startProductPurchase({
      productId,
      source: "telegram-bot",
    });

    await sessionService.save({
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      currentStep: "product_preview",
      source: "telegram-bot",
      state: result.state,
    });

    await ctx.answerCallbackQuery();
    await ctx.reply(result.message, {
      reply_markup: buildProductKeyboard(result.product.id),
    });
  });

  bot.callbackQuery(/^cart:add:(.+)$/i, async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    const productId = ctx.match[1];
    const product = await getProductById(productId);

    if (!product || !product.isActive || !product.inStock) {
      await ctx.answerCallbackQuery({ text: "That product is unavailable right now." });
      return;
    }

    const session = await sessionService.getState(String(ctx.from.id));
    const existingItem = session.state.items.find((item) => item.productId === productId);
    const nextItems = existingItem
      ? session.state.items.map((item) =>
          item.productId === productId ? { ...item, qty: item.qty + 1 } : item,
        )
      : [...session.state.items, { productId, qty: 1 }];

    await sessionService.save({
      telegramUserId: String(ctx.from.id),
      username: ctx.from.username ?? null,
      currentStep: "cart_preview",
      source: session.state.source,
      state: {
        ...session.state,
        items: nextItems,
        currentProductId: productId,
      },
      draftOrderId: session.draftOrderId ?? null,
      lastPayloadReferenceId: session.lastPayloadReferenceId ?? null,
    });

    const cartItems = await Promise.all(
      nextItems.map(async (item) => {
        const cartProduct = item.productId === productId ? product : await getProductById(item.productId);

        return {
          title: cartProduct?.title ?? item.productId,
          qty: item.qty,
          price: cartProduct?.price ?? 0,
          lineTotal: (cartProduct?.price ?? 0) * item.qty,
        };
      }),
    );
    const total = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

    await ctx.answerCallbackQuery({ text: "Added to cart." });
    await ctx.reply(
      formatCartMessage({
        shopName: "ECO BRIGHT LED & SOLAR",
        currency: product.currency,
        items: cartItems,
        total,
      }),
      { reply_markup: buildCartKeyboard() },
    );
  });
}
