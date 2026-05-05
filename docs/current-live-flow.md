# Current Live Flow

This document describes the current working website-to-Telegram system for ECO BRIGHT LED & SOLAR.

## Bot Mapping

- customer bot: `@eco_bright_bot`
- sales bot: `@eco_bright_sale_bot`
- admin bot: `@eco_bright_admin_bot`

Role split:

- website = main checkout
- customer bot = continuation and restore
- sales bot = support and clarification
- admin bot = internal lifecycle control
- Neon = source of truth

## Env Rules

Use Telegram usernames in env values.

- do not use display names
- omit the leading `@`

Example:

```env
TELEGRAM_BOT_USERNAME="eco_bright_bot"
TELEGRAM_ORDER_TARGET="eco_bright_sale_bot"
TELEGRAM_ADMIN_BOT_USERNAME="eco_bright_admin_bot"
```

## Website Flow

1. User browses products on the website.
2. User adds items to cart.
3. Website collects quantity, fulfillment, phone, optional name, and optional note.
4. Website shows invoice preview.
5. `POST /api/orders` validates the payload, re-validates product snapshot, and writes the order to Neon.
6. Website shows the success state.
7. If status is `pending`, the website pushes the user toward sales first:
   - `Contact Sales`
   - `Copy Order`
   - `Open Telegram`
8. The response includes both:
   - customer continuation deeplink
   - sales deeplink

## Customer Bot Flow

Customer bot rules now live:

1. Language selection happens first.
2. If a website payload or saved order context exists, the bot skips the large menu.
3. The restored order summary is shown immediately.
4. Primary actions stay:
   - `Confirm Order`
   - `Contact Sales`
   - `Cancel`
5. If no context exists, the customer bot shows the minimal fallback:
   - `Start Order`
   - `Paste Short Order ID`
   - `Contact Support`

Supported restore paths:

- website deeplink payload
- short order code like `ECO-8K4P2`
- legacy short order id like `ECO-2026-0001`
- pasted product link
- resumable customer draft session

## Sales Bot Flow

Sales bot rules now live:

1. Language selection happens first if no saved language exists.
2. If order context exists, the sales bot opens directly into support mode.
3. The sales bot never recreates the order.
4. Supported sales actions:
   - `Confirm Details`
   - `Ask About Stock`
   - `Change Delivery / Pickup`
   - `Add Note`
   - `Contact Human Sales`
   - `Cancel`
5. If no context exists, the fallback menu is:
   - `Paste Order ID`
   - `Paste Order Text`
   - `Ask About Product`
   - `Contact Human Sales`

Sales notes and requests are logged in order history without replacing order state in Neon.

## Admin Bot Flow

Admin bot rules now live:

1. Admin access is restricted by `ADMIN_TELEGRAM_USER_IDS`.
2. `/start` and `/admin` both open the internal admin menu.
3. Admin queues:
   - `New Orders`
   - `Pending`
   - `Processing`
   - `Completed`
   - `Search Order`
   - `Reports`
4. Every admin action reloads the latest order from Neon.
5. Every admin transition validates against the shared state machine.
6. Every admin action writes `order_status_history`.

Supported admin actions:

- `Accept`
- `Reject`
- `Clarify`
- `Processing`
- `Complete`
- `Cancel`
- `Custom Reason`
- `Add Note`
- `Refresh`

## Session Model

`telegram_sessions` is now role-aware.

Each session row supports:

- `bot_role`
- `telegram_user_id`
- `telegram_chat_id`
- `telegram_username`
- `language`
- `current_step`
- `session_json`
- `draft_order_id`
- `resume_order_id`
- `resume_order_code`
- `last_payload_reference_id`
- `last_start_payload`
- `pending_admin_action`

The same Telegram user can now safely have separate sessions in customer, sales, and admin bots.

## Runtime Commands

Use these scripts in development:

```bash
npm run bot:customer:dev
npm run bot:sales:dev
npm run bot:admin:dev
```

Backward-compatible customer bot commands:

```bash
npm run bot:dev
npm run bot:watch
```
