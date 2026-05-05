import type { Bot, Context } from "grammy";
import { parseAdminAction } from "../../../../packages/telegram-core/src";
import { getTelegramSession } from "../../../../src/db/queries/telegram-sessions";
import { applyAdminReviewAction } from "../flows/admin-review-flow";
import {
  finishAdminCustomReasonFlow,
  startAdminCustomReasonFlow,
} from "../flows/admin-custom-reason-flow";
import {
  buildAdminMenuKeyboard,
  buildAdminOrderActionsKeyboard,
  buildAdminSearchCancelKeyboard,
} from "../keyboards/admin-keyboard";
import { AdminOrderService } from "../services/admin-order-service";

function buildAdminActor(from: {
  id: number | string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}) {
  const fullName = [from.first_name, from.last_name].filter(Boolean).join(" ").trim();

  return {
    telegramUserId: String(from.id),
    username: from.username ?? null,
    displayName: fullName || from.username || String(from.id),
  };
}

export function registerAdminHandlers(bot: Bot, adminService: AdminOrderService) {
  async function replyWithReviews(
    ctx: Context,
    reviews: Awaited<ReturnType<AdminOrderService["listIncomingOrders"]>>,
    emptyMessage: string,
  ) {
    if (!reviews.length) {
      await ctx.reply(emptyMessage, { reply_markup: buildAdminMenuKeyboard() });
      return;
    }

    await ctx.reply(`Loaded ${reviews.length} order(s).`, {
      reply_markup: buildAdminMenuKeyboard(),
    });

    for (const review of reviews) {
      await ctx.reply(review.text, {
        reply_markup: buildAdminOrderActionsKeyboard(review.keyboard),
      });
    }
  }

  async function openAdminMenu(ctx: Context) {
    if (!ctx.from) {
      await ctx.reply("Missing Telegram user context.");
      return;
    }

    try {
      adminService.assertAuthorized(String(ctx.from.id), ctx.from.username ?? null);
      await adminService.showMenuMode({
        telegramUserId: String(ctx.from.id),
        username: ctx.from.username ?? null,
        targetChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
      });
      await ctx.reply("Admin review menu", {
        reply_markup: buildAdminMenuKeyboard(),
      });
    } catch (error) {
      await ctx.reply(
        error instanceof Error ? error.message : "Unable to open the admin queue.",
      );
    }
  }

  bot.command("start", openAdminMenu);
  bot.command("admin", openAdminMenu);

  bot.callbackQuery(/^admin:/i, async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    try {
      adminService.assertAuthorized(String(ctx.from.id), ctx.from.username ?? null);

      switch (ctx.callbackQuery.data) {
        case "admin:queue:new":
        case "admin:queue:pending": {
          await ctx.answerCallbackQuery();
          const reviews = await adminService.listOrdersByStatus(["pending"], 6);
          await replyWithReviews(ctx, reviews, "No pending orders right now.");
          return;
        }
        case "admin:queue:processing": {
          await ctx.answerCallbackQuery();
          const reviews = await adminService.listOrdersByStatus(["processing"], 6);
          await replyWithReviews(ctx, reviews, "No processing orders right now.");
          return;
        }
        case "admin:queue:completed": {
          await ctx.answerCallbackQuery();
          const reviews = await adminService.listOrdersByStatus(["completed"], 6);
          await replyWithReviews(ctx, reviews, "No completed orders found.");
          return;
        }
        case "admin:search": {
          await adminService.beginSearchMode({
            telegramUserId: String(ctx.from.id),
            username: ctx.from.username ?? null,
            targetChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
          });
          await ctx.answerCallbackQuery();
          await ctx.reply("Send an Order ID, Invoice ID, or short code to search.", {
            reply_markup: buildAdminSearchCancelKeyboard(),
          });
          return;
        }
        case "admin:cancel-search": {
          await adminService.showMenuMode({
            telegramUserId: String(ctx.from.id),
            username: ctx.from.username ?? null,
            targetChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
          });
          await ctx.answerCallbackQuery();
          await ctx.reply("Admin review menu", {
            reply_markup: buildAdminMenuKeyboard(),
          });
          return;
        }
        case "admin:reports": {
          const [pending, processing, completed] = await Promise.all([
            adminService.listOrdersByStatus(["pending"], 20),
            adminService.listOrdersByStatus(["processing"], 20),
            adminService.listOrdersByStatus(["completed"], 20),
          ]);
          await ctx.answerCallbackQuery();
          await ctx.reply(
            [
              "Reports",
              "",
              `Pending: ${pending.length}`,
              `Processing: ${processing.length}`,
              `Completed: ${completed.length}`,
            ].join("\n"),
            { reply_markup: buildAdminMenuKeyboard() },
          );
          return;
        }
        default:
          await ctx.answerCallbackQuery({ text: "Unknown admin menu action." });
      }
    } catch (error) {
      await ctx.answerCallbackQuery({
        text: error instanceof Error ? error.message : "Admin action failed.",
      });
    }
  });

  bot.callbackQuery(/^adm:/i, async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Missing Telegram user context." });
      return;
    }

    try {
      adminService.assertAuthorized(String(ctx.from.id), ctx.from.username ?? null);

      const parsed = parseAdminAction(ctx.callbackQuery.data);

      if (!parsed) {
        await ctx.answerCallbackQuery({ text: "Unknown admin action." });
        return;
      }

      const actor = buildAdminActor(ctx.from);

      if (parsed.action === "reason" || parsed.action === "note" || parsed.action === "clarify") {
        const started = await startAdminCustomReasonFlow(adminService, {
          telegramUserId: String(ctx.from.id),
          username: ctx.from.username ?? null,
          orderId: parsed.orderId,
          action:
            parsed.action === "note"
              ? "note"
              : parsed.action === "clarify"
                ? "clarify"
                : "reject",
          targetChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
        });

        await ctx.answerCallbackQuery();
        await ctx.reply(started.prompt);
        return;
      }

      const review = await applyAdminReviewAction(adminService, {
        action: parsed.action,
        orderId: parsed.orderId,
        actor,
      });

      await ctx.answerCallbackQuery({ text: `Order ${review.order.invoiceId} updated.` });

      await ctx.editMessageText(review.text, {
        reply_markup: buildAdminOrderActionsKeyboard(review.keyboard),
      });
    } catch (error) {
      await ctx.answerCallbackQuery({
        text: error instanceof Error ? error.message : "Admin action failed.",
      });
    }
  });

  bot.on("message:text", async (ctx, next) => {
    if (!ctx.from) {
      await next();
      return;
    }

    if (!adminService.isAuthorized(String(ctx.from.id))) {
      await next();
      return;
    }

    const pending = await adminService.getPendingTextAction(String(ctx.from.id));
    const session = await getTelegramSession(String(ctx.from.id), "admin");

    if (!pending && session?.currentStep !== "admin_awaiting_search") {
      await next();
      return;
    }

    try {
      const text = ctx.message.text.trim();

      if (/^\/cancel$|^cancel$/i.test(text)) {
        await adminService.cancelPendingTextAction({
          telegramUserId: String(ctx.from.id),
          username: ctx.from.username ?? null,
        });

        await ctx.reply("Pending admin input was cancelled.");
        return;
      }

      if (session?.currentStep === "admin_awaiting_search") {
        const results = await adminService.searchOrders(text, 6);

        if (!results.length) {
          await ctx.reply("No orders matched that search.", {
            reply_markup: buildAdminSearchCancelKeyboard(),
          });
          return;
        }

        await adminService.showMenuMode({
          telegramUserId: String(ctx.from.id),
          username: ctx.from.username ?? null,
          targetChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
        });

        await replyWithReviews(ctx, results, "No orders matched that search.");
        return;
      }

      const result = await finishAdminCustomReasonFlow(adminService, {
        telegramUserId: String(ctx.from.id),
        username: ctx.from.username ?? null,
        text,
        actor: buildAdminActor(ctx.from),
      });

      if (!result) {
        await next();
        return;
      }

      await ctx.reply(result.confirmationText);
      await ctx.reply(result.review.text, {
        reply_markup: buildAdminOrderActionsKeyboard(result.review.keyboard),
      });
    } catch (error) {
      await ctx.reply(
        error instanceof Error ? error.message : "Unable to save the admin response.",
      );
    }
  });
}
