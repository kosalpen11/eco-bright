import type { Bot } from "grammy";
import { getSharedRuntimeConfig } from "../../../../packages/config/src";
import { buildSupportMessage } from "../../../../packages/telegram-core/src";
import { buildSupportKeyboard } from "../keyboards/common-keyboard";
import { buildOrderModificationBotUrl } from "../../../../src/lib/telegram-order/build-order-deeplink";
import { extractTelegramUsername } from "../../../../src/lib/telegram-order/validate-telegram-config";
import { SalesSupportQueryService } from "../services/sales-support-query-service";
import { TelegramSessionService } from "../services/telegram-session-service";

export function registerSupportHandlers(
  bot: Bot,
  sessionService: TelegramSessionService,
  salesSupportService: SalesSupportQueryService,
) {
  async function replyWithSupportMessage(input: {
    reply: (message: string, extra: { reply_markup: ReturnType<typeof buildSupportKeyboard> }) => Promise<unknown>;
    telegramUserId?: string;
  }) {
    const config = getSharedRuntimeConfig();
    const supportTarget = config.TELEGRAM_SUPPORT_TARGET ?? config.TELEGRAM_ORDER_TARGET;

    if (input.telegramUserId) {
      const session = await sessionService.getState(input.telegramUserId);
      const orderId = session.draftOrderId ?? session.state.draftOrderId ?? null;

      if (orderId) {
        const supportContext = await salesSupportService.buildOrderSupportContext(orderId);

        if (supportContext) {
          const salesBotUsername = extractTelegramUsername(supportTarget);
          const salesBotUrl =
            salesBotUsername && supportContext.order.order.shortOrderId
              ? buildOrderModificationBotUrl(
                  salesBotUsername,
                  supportContext.order.order.shortOrderId,
                )
              : supportTarget;

          await input.reply(supportContext.message, {
            reply_markup: buildSupportKeyboard(salesBotUrl),
          });
          return;
        }
      }
    }

    await input.reply(
      buildSupportMessage(config.NEXT_PUBLIC_SHOP_NAME, supportTarget),
      { reply_markup: buildSupportKeyboard(supportTarget) },
    );
  }

  bot.command("support", async (ctx) => {
    await replyWithSupportMessage({
      reply: (message, extra) => ctx.reply(message, extra),
      telegramUserId: ctx.from ? String(ctx.from.id) : undefined,
    });
  });

  bot.callbackQuery("support", async (ctx) => {
    await ctx.answerCallbackQuery();
    await replyWithSupportMessage({
      reply: (message, extra) => ctx.reply(message, extra),
      telegramUserId: ctx.from ? String(ctx.from.id) : undefined,
    });
  });
}
