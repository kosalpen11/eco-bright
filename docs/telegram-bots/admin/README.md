# Admin Bot README

This document explains the admin/operator Telegram review flow for ECO BRIGHT LED & SOLAR.

It is written for engineers and operators who need to understand how new orders reach Telegram, how admins act on orders, and how those actions are written back to Neon safely.

Related docs:

- `../menu-tree.md`
- `../message-copy.md`

## Goal

Allow internal staff to:

1. receive new incoming orders in Telegram
2. review the full order summary quickly
3. accept, reject, request clarification, process, complete, or cancel
4. add custom reason text or internal notes
5. update Neon with valid lifecycle transitions only
6. keep a full audit trail in `order_status_history`

## Important Rules

- admin actions must always reload the latest order state from Neon before applying any transition
- valid transitions are enforced by the shared order-core state machine
- admin free-text actions use pending session state and can be cancelled before submission
- customer notification is optional and only safe when a customer Telegram chat id is available

## Architecture Map

Admin runtime:

- [`apps/telegram-bot/src/handlers/admin.ts`](../../../apps/telegram-bot/src/handlers/admin.ts)
- [`apps/telegram-bot/src/services/admin-order-service.ts`](../../../apps/telegram-bot/src/services/admin-order-service.ts)
- [`apps/telegram-bot/src/flows/admin-review-flow.ts`](../../../apps/telegram-bot/src/flows/admin-review-flow.ts)
- [`apps/telegram-bot/src/flows/admin-custom-reason-flow.ts`](../../../apps/telegram-bot/src/flows/admin-custom-reason-flow.ts)

Shared admin Telegram builders:

- [`packages/telegram-core/src/admin`](../../../packages/telegram-core/src/admin)

Shared business rules:

- [`packages/order-core/src/admin`](../../../packages/order-core/src/admin)
- [`packages/order-core/src/order-status-machine.ts`](../../../packages/order-core/src/order-status-machine.ts)

Persistence:

- [`src/db/queries/orders.ts`](../../../src/db/queries/orders.ts)
- [`src/db/queries/telegram-sessions.ts`](../../../src/db/queries/telegram-sessions.ts)
- [`src/db/schema.ts`](../../../src/db/schema.ts)

## Default Deployment Model

Target business split:

- `@eco_bright_bot` = customer conversion
- `@eco_bright_sale_bot` = sales and support communication
- `@eco_bright_admin_bot` = admin operations

Current default runtime mode:

- customer flow and admin flow still run on the same bot token
- only allowlisted Telegram user ids can access admin actions
- sales/support communication is already kept separate through the sales target bot

Default env shape:

```env
TELEGRAM_BOT_TOKEN=""
TELEGRAM_BOT_USERNAME="eco_bright_bot"
ADMIN_TELEGRAM_USER_IDS="123456789,987654321"
ADMIN_TELEGRAM_CHAT_ID=""
```

Dedicated admin bot runtime:

```env
TELEGRAM_ADMIN_BOT_TOKEN=""
TELEGRAM_ADMIN_BOT_USERNAME="eco_bright_admin_bot"
```

The admin flow now runs on its own bot runtime while still reusing the same order-core and telegram-core packages.

Recommended role mapping for this project:

- customer bot: `@eco_bright_bot`
- sales/support handoff target: `@eco_bright_sale_bot`
- admin bot: `@eco_bright_admin_bot`

## Admin Access Control

Authorization is enforced by:

- `ADMIN_TELEGRAM_USER_IDS`
- [`packages/config/src/index.ts`](../../../packages/config/src/index.ts)
- [`apps/telegram-bot/src/services/admin-order-service.ts`](../../../apps/telegram-bot/src/services/admin-order-service.ts)

Rules:

- only allowlisted Telegram user ids can use `/admin`
- only allowlisted users can trigger `adm:*` callbacks
- unauthorized attempts are rejected and logged

## How New Orders Reach Admin Telegram

When a web order is created:

1. `/api/orders` validates the request
2. order and order items are written to Neon
3. a `pending` history row is created
4. if `ADMIN_TELEGRAM_CHAT_ID` is configured, the app sends the admin summary message to Telegram

Notification entry point:

- [`src/app/api/orders/route.ts`](../../../src/app/api/orders/route.ts)
- [`packages/telegram-core/src/admin/notify-admin-order-created.ts`](../../../packages/telegram-core/src/admin/notify-admin-order-created.ts)

## Admin Order Message Design

The admin message includes:

- order id
- invoice id
- source
- created time
- customer name and phone if present
- customer note if present
- admin note if present
- rejection reason if present
- full item list
- subtotal
- total
- current status

Message builder:

- [`packages/telegram-core/src/admin/build-admin-order-message.ts`](../../../packages/telegram-core/src/admin/build-admin-order-message.ts)

## Inline Admin Actions

Current inline actions:

- Accept
- Reject
- Clarify
- Processing
- Complete
- Cancel
- Custom Reason
- Add Note
- Refresh

Keyboard builder:

- [`packages/telegram-core/src/admin/build-admin-order-keyboard.ts`](../../../packages/telegram-core/src/admin/build-admin-order-keyboard.ts)

## Callback Payload Format

Admin callback payloads are intentionally compact:

```text
adm:accept:<orderId>
adm:reject:<orderId>
adm:clarify:<orderId>
adm:processing:<orderId>
adm:complete:<orderId>
adm:cancel:<orderId>
adm:reason:<orderId>
adm:note:<orderId>
adm:refresh:<orderId>
```

Parser:

- [`packages/telegram-core/src/admin/parse-admin-action.ts`](../../../packages/telegram-core/src/admin/parse-admin-action.ts)

Important rule:

- callback payloads contain only action + order id
- the bot always re-reads the latest order from Neon before applying any update

## Order Status Lifecycle

Supported statuses:

- `draft`
- `pending`
- `accepted`
- `rejected`
- `needs_clarification`
- `processing`
- `completed`
- `cancelled`

Current valid transitions:

- `draft -> pending, cancelled`
- `pending -> accepted, rejected, needs_clarification, processing, cancelled`
- `accepted -> processing, completed, needs_clarification, cancelled`
- `needs_clarification -> pending, accepted, rejected, cancelled`
- `processing -> completed, needs_clarification, cancelled`
- `rejected -> terminal`
- `completed -> terminal`
- `cancelled -> terminal`

State machine:

- [`packages/order-core/src/order-status-machine.ts`](../../../packages/order-core/src/order-status-machine.ts)

## Admin Action Services

Every admin action goes through shared order-core helpers:

- [`packages/order-core/src/admin/accept-order.ts`](../../../packages/order-core/src/admin/accept-order.ts)
- [`packages/order-core/src/admin/reject-order.ts`](../../../packages/order-core/src/admin/reject-order.ts)
- [`packages/order-core/src/admin/request-clarification.ts`](../../../packages/order-core/src/admin/request-clarification.ts)
- [`packages/order-core/src/admin/mark-processing.ts`](../../../packages/order-core/src/admin/mark-processing.ts)
- [`packages/order-core/src/admin/complete-order.ts`](../../../packages/order-core/src/admin/complete-order.ts)
- [`packages/order-core/src/admin/cancel-order.ts`](../../../packages/order-core/src/admin/cancel-order.ts)
- [`packages/order-core/src/admin/add-admin-note.ts`](../../../packages/order-core/src/admin/add-admin-note.ts)

These services:

1. load the latest order
2. validate the status transition
3. update the order row
4. set reviewed-by metadata
5. append admin note or rejection reason when relevant
6. write a status-history row

## Admin Free Text Flow

Some actions need operator text entry:

- custom rejection reason
- clarification request
- internal note

Flow:

1. admin taps `Custom Reason`, `Clarify`, or `Add Note`
2. bot stores `selectedOrderId` and `pendingAction` in `telegram_sessions`
3. bot asks for the next text message
4. admin types the message
5. bot saves it to Neon using the shared admin service
6. bot returns the refreshed order summary

Session fields used:

- `selectedOrderId`
- `pendingAction`
- `targetChatId`

Session steps used:

- `admin_review`
- `admin_awaiting_reason`
- `admin_awaiting_note`

## Database Design

Relevant tables:

- `orders`
- `order_items`
- `order_status_history`
- `telegram_sessions`

Admin fields on `orders`:

- `admin_note`
- `rejection_reason`
- `accepted_at`
- `rejected_at`
- `processed_at`
- `completed_at`
- `cancelled_at`
- `reviewed_by_telegram_user_id`
- `reviewed_by_name`

Audit table:

- `order_status_history`

History columns:

- `from_status`
- `to_status`
- `action`
- `reason`
- `actor_type`
- `actor_id`
- `actor_name`
- `created_at`

## Customer Notification Design

Customer notification is optional by design.

Shared notification helpers:

- [`packages/telegram-core/src/notifications/build-customer-status-message.ts`](../../../packages/telegram-core/src/notifications/build-customer-status-message.ts)
- [`packages/telegram-core/src/notifications/notify-customer-order-updated.ts`](../../../packages/telegram-core/src/notifications/notify-customer-order-updated.ts)

Current limitation:

- the customer Telegram identity is now stored on orders, but automatic customer follow-up is still an optional integration path rather than a fully wired notification workflow
- shared-bot mode works today, but large teams will eventually benefit from a dedicated admin bot or assignment model

## Operator Commands

Today’s main admin entry command:

- `/admin`

Behavior:

1. loads recent active reviewable orders
2. sends each order as a separate Telegram message
3. attaches inline action buttons

## Recommended Future Improvements

1. support separate customer and admin bot tokens in production
2. turn stored customer Telegram identity into automatic status notifications
3. add admin list filters such as `pending only` or `processing only`
4. add assignment / ownership for large sales teams
5. add admin dashboard UI on top of the same order and history tables
