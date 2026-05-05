import { existsSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

const optionalTrimmedString = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  },
  z.string().min(1).optional(),
);

const sharedEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SHOP_NAME: z.string().default("ECO BRIGHT LED & SOLAR"),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  TELEGRAM_BOT_USERNAME: optionalTrimmedString,
  TELEGRAM_ORDER_TARGET: z.string().min(1).default("eco_bright_sale_bot"),
  TELEGRAM_SUPPORT_TARGET: optionalTrimmedString,
  TELEGRAM_SALES_BOT_TOKEN: optionalTrimmedString,
  TELEGRAM_ADMIN_BOT_USERNAME: optionalTrimmedString,
  TELEGRAM_ADMIN_BOT_TOKEN: optionalTrimmedString,
  ADMIN_TELEGRAM_USER_IDS: optionalTrimmedString,
  ADMIN_TELEGRAM_CHAT_ID: optionalTrimmedString,
});

const telegramBotEnvSchema = sharedEnvSchema.extend({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_BOT_USERNAME: z.string().min(1),
});

const telegramAdminEnvSchema = sharedEnvSchema.extend({
  TELEGRAM_BOT_TOKEN: optionalTrimmedString,
});

function parseCsvList(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export interface TelegramAdminRuntimeConfig {
  enabled: boolean;
  adminUserIds: string[];
  adminChatId: string | null;
  botToken: string | null;
  botUsername: string | null;
}

export function loadWorkspaceEnv() {
  const cwd = process.cwd();
  const candidateDirs = [
    cwd,
    path.resolve(cwd, ".."),
    path.resolve(cwd, "../.."),
  ];
  const seen = new Set<string>();

  for (const dir of candidateDirs) {
    const localPath = path.join(dir, ".env.local");
    const envPath = path.join(dir, ".env");

    if (!seen.has(localPath) && existsSync(localPath)) {
      loadEnv({ path: localPath, quiet: true });
      seen.add(localPath);
    }

    if (!seen.has(envPath) && existsSync(envPath)) {
      loadEnv({ path: envPath, quiet: true });
      seen.add(envPath);
    }
  }
}

export function getSharedRuntimeConfig(env = process.env) {
  return sharedEnvSchema.parse(env);
}

export function getTelegramBotRuntimeConfig(env = process.env) {
  return telegramBotEnvSchema.parse(env);
}

export function getTelegramSalesBotRuntimeConfig(env = process.env) {
  const parsed = sharedEnvSchema.parse(env);
  const botToken = parsed.TELEGRAM_SALES_BOT_TOKEN ?? null;
  const botUsername = parsed.TELEGRAM_ORDER_TARGET;

  return {
    enabled: !!botToken,
    botToken,
    botUsername,
  };
}

export function getTelegramAdminRuntimeConfig(
  env = process.env,
): TelegramAdminRuntimeConfig {
  const parsed = telegramAdminEnvSchema.parse(env);
  const adminUserIds = parseCsvList(parsed.ADMIN_TELEGRAM_USER_IDS);
  const botToken = parsed.TELEGRAM_ADMIN_BOT_TOKEN ?? parsed.TELEGRAM_BOT_TOKEN ?? null;
  const botUsername =
    parsed.TELEGRAM_ADMIN_BOT_USERNAME ?? parsed.TELEGRAM_BOT_USERNAME ?? null;
  const adminChatId = parsed.ADMIN_TELEGRAM_CHAT_ID ?? null;

  return {
    enabled: !!botToken && (!!adminChatId || adminUserIds.length > 0),
    adminUserIds,
    adminChatId,
    botToken,
    botUsername,
  };
}

export function isTelegramAdminUser(telegramUserId: string, env = process.env) {
  const config = getTelegramAdminRuntimeConfig(env);
  return config.adminUserIds.includes(telegramUserId);
}
