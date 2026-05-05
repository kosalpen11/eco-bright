import { Bot, GrammyError, HttpError } from "grammy";

export function createTelegramBotRuntime(botToken: string, roleLabel: string) {
  const bot = new Bot(botToken);

  bot.catch((error) => {
    const { ctx } = error;
    console.error(
      `Telegram ${roleLabel} bot error while handling update ${ctx.update.update_id}`,
      error,
    );

    if (error.error instanceof GrammyError) {
      console.error("Telegram API error", error.error.description);
      return;
    }

    if (error.error instanceof HttpError) {
      console.error("Telegram HTTP error", error.error);
    }
  });

  return bot;
}
