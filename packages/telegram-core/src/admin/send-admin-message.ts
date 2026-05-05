import type {
  AdminKeyboardLayout,
  TelegramApiResponse,
} from "./types";

function buildReplyMarkup(keyboard?: AdminKeyboardLayout) {
  if (!keyboard?.length) {
    return undefined;
  }

  return {
    inline_keyboard: keyboard.map((row) =>
      row.map((button) => ({
        text: button.text,
        callback_data: button.callbackData,
      })),
    ),
  };
}

async function callTelegramApi<T extends TelegramApiResponse>(
  botToken: string,
  method: string,
  payload: Record<string, unknown>,
) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as T;

  if (!response.ok || !data.ok) {
    throw new Error(data.description ?? `Telegram API ${method} failed`);
  }

  return data;
}

export async function sendAdminMessage(input: {
  botToken: string;
  chatId: string;
  text: string;
  keyboard?: AdminKeyboardLayout;
}) {
  return callTelegramApi(input.botToken, "sendMessage", {
    chat_id: input.chatId,
    text: input.text,
    reply_markup: buildReplyMarkup(input.keyboard),
  });
}

export async function editAdminMessage(input: {
  botToken: string;
  chatId: string;
  messageId: number;
  text: string;
  keyboard?: AdminKeyboardLayout;
}) {
  return callTelegramApi(input.botToken, "editMessageText", {
    chat_id: input.chatId,
    message_id: input.messageId,
    text: input.text,
    reply_markup: buildReplyMarkup(input.keyboard),
  });
}
