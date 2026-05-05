import { buildStartPayload } from "./build-start-payload";
import type {
  TelegramBotLinkInput,
  TelegramFallbackLinkInput,
} from "../types";
import type { TelegramStartPayload } from "../../../shared/src";

export function buildTelegramBotLink(input: TelegramBotLinkInput) {
  const botUsername = input.botUsername.trim().replace(/^@/, "");
  return `https://t.me/${botUsername}?start=${encodeURIComponent(input.payload)}`;
}

export function buildTelegramBotLinkFromPayload(botUsername: string | undefined, payload: TelegramStartPayload) {
  if (!botUsername) {
    throw new Error("Bot username is required");
  }
  return buildTelegramBotLink({
    botUsername,
    payload: buildStartPayload(payload),
  });
}

export function buildTelegramFallbackLink(input: TelegramFallbackLinkInput) {
  return buildTelegramBotLinkFromPayload(input.botUsername, {
    version: 1,
    type: "reference",
    referenceId: input.referenceId,
  });
}
