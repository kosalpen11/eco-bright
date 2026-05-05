# Customer Bot README

This document explains the customer-facing Telegram purchase flow for ECO BRIGHT LED & SOLAR.

It is written for engineers and product owners who need to understand how the website hands customers into Telegram, how the bot restores order context, and what the customer experiences inside Telegram.

Related docs:

- `../menu-tree.md`
- `../message-copy.md`

## Goal

Allow a customer to:

1. browse products on the website
2. click a Telegram order link from a product or cart
3. enter Telegram with the product or order context already loaded
4. confirm quantity and customer details
5. create the order in Neon
6. receive a clean Telegram order summary

Customer bot responsibility:

- help the customer create the order
- keep checkout short and guided
- avoid turning support chat into checkout logic

## Important Rules

- a draft order is created or refreshed before final review, not only at the final confirm tap
- final confirm is idempotent, so repeated taps do not create duplicate completion side effects
- deeplink references can expire through the `deeplink_payloads.expires_at` field
- customer sessions can be resumed or cancelled from Telegram
- Telegram-created orders store customer Telegram user id, username, and chat id for future support and notification flows

## Architecture Map

Customer flow runtime:

- [`apps/telegram-bot/src/bot.ts`](../../../apps/telegram-bot/src/bot.ts)
- [`apps/telegram-bot/src/handlers/start.ts`](../../../apps/telegram-bot/src/handlers/start.ts)
- [`apps/telegram-bot/src/handlers/order.ts`](../../../apps/telegram-bot/src/handlers/order.ts)
- [`apps/telegram-bot/src/flows/purchase-flow.ts`](../../../apps/telegram-bot/src/flows/purchase-flow.ts)
- [`apps/telegram-bot/src/flows/quick-order-flow.ts`](../../../apps/telegram-bot/src/flows/quick-order-flow.ts)
- [`apps/telegram-bot/src/flows/pasted-link-flow.ts`](../../../apps/telegram-bot/src/flows/pasted-link-flow.ts)

Shared deeplink and messaging:

- [`packages/telegram-core/src/deeplink`](../../../packages/telegram-core/src/deeplink)
- [`packages/telegram-core/src/messages`](../../../packages/telegram-core/src/messages)

Shared order logic:

- [`packages/order-core/src/create-draft-order.ts`](../../../packages/order-core/src/create-draft-order.ts)
- [`packages/order-core/src/finalize-order.ts`](../../../packages/order-core/src/finalize-order.ts)
- [`packages/order-core/src/order-status-machine.ts`](../../../packages/order-core/src/order-status-machine.ts)

## Customer Flow Variants

### 1. Product Deeplink From Website

Best for a single product CTA such as "Order in Telegram".

Flow:

1. Website builds a compact bot start payload.
2. Customer opens:

```text
https://t.me/<bot_username>?start=<payload>
```

3. The bot parses the payload in [`packages/telegram-core/src/deeplink/parse-start-payload.ts`](../../../packages/telegram-core/src/deeplink/parse-start-payload.ts).
4. The product is loaded from Neon.
5. The bot shows a product preview and quantity choices.
6. The customer picks a quantity.
7. The bot asks for phone number.
8. The bot asks for optional name.
9. The bot offers optional note.
10. The bot shows review and confirm.
11. On confirm, the bot creates or refreshes a draft order, then finalizes it to `pending`.

Current start payload format:

```text
v1.p.<productId>
v1.p.<productId>.q2
```

Example:

```text
https://t.me/eco_bright_bot?start=v1.p.prd_001.q2
```

### 2. Cart / Quick-Order Reference Flow

Best when the website cart has more context than fits safely inside Telegram `start`.

Flow:

1. Website stores a compact payload reference in `deeplink_payloads`.
2. Website sends the customer to:

```text
https://t.me/<bot_username>?start=v1.r.<referenceId>
```

or

```text
https://t.me/<bot_username>?start=v1.c.<referenceId>
```

3. The bot loads the reference from Neon.
4. The bot restores the order context.
5. The customer continues the normal review and confirm flow.

Important current note:

- the current quick-order reference implementation in [`apps/telegram-bot/src/flows/quick-order-flow.ts`](../../../apps/telegram-bot/src/flows/quick-order-flow.ts) supports product-based reference payloads today
- multi-item cart restoration is the intended architecture, but the current code path still resolves a single product payload from the stored reference

### 3. Direct Bot Flow

Best for customers who open the bot directly without website context.

Flow:

1. Customer runs `/start`
2. Bot initializes a fresh session
3. Bot shows the main menu:
   - Shop Products
   - Browse Categories
   - Search Product
   - Paste Product Link
   - My Cart
   - My Orders
   - Contact Support
4. Customer can continue from categories, search, pasted link flow, or cart review

The customer bot should stop trying to be a human sales chat. Human follow-up belongs to `@eco_bright_sale_bot`.

### 4. Pasted Link Flow

Best when a customer pastes a website product link into Telegram manually.

Flow:

1. Customer sends a storefront URL in chat
2. The bot attempts to resolve the link
3. If matched, it starts the same product purchase flow
4. If not matched, the bot falls back to category browsing

## Session Model

Customer sessions are stored in `telegram_sessions`.

Important fields:

- `telegram_user_id`
- `current_step`
- `draft_order_id`
- `last_payload_reference_id`
- `session_json`

Customer state in `session_json` includes:

- `source`
- `items`
- `currentProductId`
- `customerName`
- `customerPhone`
- `note`
- `deeplinkReferenceId`
- `draftOrderId`
- `lastResolvedLink`

Current customer session steps:

- `idle`
- `home`
- `product_preview`
- `cart_preview`
- `awaiting_search`
- `awaiting_pasted_link`
- `awaiting_fulfillment`
- `awaiting_quantity`
- `awaiting_phone`
- `awaiting_name`
- `awaiting_note`
- `review`
- `completed`
- `cancelled`

Resume behavior:

- if the customer runs `/start` while an order is still active, the bot offers `Resume order` or `Cancel order`
- the current step determines the resume prompt shown to the customer

## Order Lifecycle

Customer bot interacts with the shared order lifecycle:

- `draft`
- `pending`
- `accepted`
- `rejected`
- `needs_clarification`
- `processing`
- `completed`
- `cancelled`

Customer flow behavior today:

- create draft only when review is ready
- collect pickup or delivery choice before review
- finalize to `pending` when customer confirms
- admin or internal staff own the later lifecycle steps

## Data Written to Neon

Tables involved:

- `orders`
- `order_items`
- `telegram_sessions`
- `deeplink_payloads`
- `order_status_history`

On order confirmation:

1. order row is written
2. order items are written
3. initial `pending` history row is logged
4. Telegram summary message is returned to the customer

## UX Principles

Customer Telegram UX should be:

- short, not verbose
- button-driven where possible
- easy on one hand / mobile
- clear about next step
- clear when the order is already saved

Message types:

- welcome
- main menu
- product preview
- cart review
- orders list
- search prompt
- pasted-link prompt
- quantity choice
- review prompt
- final order summary

## Failure Handling

Current failure states:

- invalid start payload
- expired reference payload
- unavailable product
- pasted link not found
- draft order not found
- failed DB write

Expected response:

- reply with a short actionable message
- return the user to a known safe step
- avoid silent failure

## Environment

Minimum env for customer flow:

```env
DATABASE_URL=""
TELEGRAM_BOT_TOKEN=""
TELEGRAM_BOT_USERNAME="eco_bright_bot"
TELEGRAM_ORDER_TARGET="eco_bright_sale_bot"
```

Recommended role mapping for this project:

- customer deeplink bot: `@eco_bright_bot`
- sales/support chat target: `@eco_bright_sale_bot`

## Start Commands

Install and run:

```bash
npm install
npm run bot:dev
```

## Current Limitations

- multi-item cart restoration from quick-order references is not complete yet
- category browsing inside Telegram is still lightweight
- customer status notifications depend on the stored Telegram identity and are not yet turned into a full customer notification workflow

## Suggested Future Improvements

1. support real multi-item cart references in quick-order flow
2. turn stored customer Telegram identity into a full outbound status-notification workflow
3. add browse-by-category inline callbacks
4. add search inside Telegram bot
5. add payment step after order confirmation
