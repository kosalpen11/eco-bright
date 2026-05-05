# Telegram Bot Docs

This folder documents the 3-bot operating model for ECO BRIGHT LED & SOLAR.

## Role Split

- Customer bot: `@eco_bright_bot`
- Sales bot: `@eco_bright_sale_bot`
- Admin bot: `@eco_bright_admin_bot`

Ownership:

- customer bot = continuation
- sales bot = support
- admin bot = internal control
- Neon = source of truth

## Runtime Files

- customer runtime: `/Users/kosalpen/Documents/eco-bright/apps/telegram-bot/src/customer-bot.ts`
- sales runtime: `/Users/kosalpen/Documents/eco-bright/apps/telegram-bot/src/sales-bot.ts`
- admin runtime: `/Users/kosalpen/Documents/eco-bright/apps/telegram-bot/src/admin-bot.ts`

## Main Code Boundaries

- customer handlers: `/Users/kosalpen/Documents/eco-bright/apps/telegram-bot/src/handlers/customer.ts`
- sales handlers: `/Users/kosalpen/Documents/eco-bright/apps/telegram-bot/src/handlers/sales.ts`
- admin handlers: `/Users/kosalpen/Documents/eco-bright/apps/telegram-bot/src/handlers/admin.ts`
- shared Telegram helpers: `/Users/kosalpen/Documents/eco-bright/packages/telegram-core/src/index.ts`
- shared order state machine: `/Users/kosalpen/Documents/eco-bright/packages/order-core/src/order-status-machine.ts`
- shared DB queries: `/Users/kosalpen/Documents/eco-bright/src/db/queries/orders.ts`

## Env Shape

```env
DATABASE_URL="..."
TELEGRAM_BOT_TOKEN=""
TELEGRAM_BOT_USERNAME="eco_bright_bot"
TELEGRAM_SALES_BOT_TOKEN=""
TELEGRAM_ORDER_TARGET="eco_bright_sale_bot"
TELEGRAM_ADMIN_BOT_TOKEN=""
TELEGRAM_ADMIN_BOT_USERNAME="eco_bright_admin_bot"
ADMIN_TELEGRAM_USER_IDS="123456789,987654321"
ADMIN_TELEGRAM_CHAT_ID=""
```

Rules:

- use Telegram usernames
- no leading `@`
- do not use display names

## Session Rules

`telegram_sessions` is role-aware.

Each bot stores its own session row by:

- `bot_role`
- `telegram_user_id`

This prevents customer, sales, and admin state from colliding for the same Telegram user.

## Operating Notes

- The website always creates the order first for website checkout.
- Customer bot continues saved orders and does not restart shopping when context exists.
- Sales bot stays support-focused and logs support requests without becoming the source of truth.
- Admin bot always reloads the latest Neon order before any action.
