# Telegram Purchase Flow

Detailed role-based docs:

- [Customer Bot README](/Users/kosalpen/Documents/eco-bright/docs/telegram-bots/customer/README.md)
- [Admin Bot README](/Users/kosalpen/Documents/eco-bright/docs/telegram-bots/admin/README.md)
- [Sales Team Guide](/Users/kosalpen/Documents/eco-bright/docs/telegram-bots/sales-team/README.md)

## Deeplink Product Flow

1. Web generates a compact bot payload.
2. User opens `https://t.me/<bot>?start=<payload>`.
3. Bot restores product context.
4. Bot asks for quantity.
5. Bot collects customer phone and optional name/note.
6. Bot creates a draft order when review is ready.
7. Bot finalizes the order on confirmation.
8. Bot returns order id + invoice summary.

## Deeplink Cart Flow

1. Web stores a large cart in `deeplink_payloads`.
2. Deeplink carries only the reference id.
3. Bot restores that context from Neon.
4. Bot shows the restored draft and continues to review.

## Session Model

- `telegram_user_id` identifies the user
- `current_step` tracks the conversation position
- `session_json` stores selected items and customer fields
- `draft_order_id` lets the flow resume safely
- `last_payload_reference_id` links back to deeplink context when needed

Important flow rules now enforced in code:

- create or restore a draft order before the customer reaches final review
- final confirmation is idempotent
- deeplink payloads support expiry through `expires_at`
- sessions support resume and cancel behavior
- admin free-text actions are stored as pending session state until completed or cancelled
- orders created from Telegram store customer Telegram identity for support and future notifications

## Admin Review Flow

1. A new order is written to Neon first.
2. The system optionally forwards the order to `ADMIN_TELEGRAM_CHAT_ID`.
3. Admins use inline actions with compact payloads like `adm:accept:<orderId>`.
4. The bot always reloads the latest order from Neon before applying any admin action.
5. Valid transitions are enforced by the shared order-core state machine.
6. Free-text actions such as rejection reasons or clarification prompts use `telegram_sessions` to hold the pending admin step.

### Admin Actions

- Accept
- Reject
- Clarify
- Processing
- Complete
- Cancel
- Custom Reason
- Add Note
- Refresh

### Auditability

- The current review state lives on the `orders` row.
- Every admin transition writes an `order_status_history` row with actor, action, and optional reason.
- Customer notification is intentionally optional and should only run when a customer Telegram chat id is available.

### Default Env Shape

Shared-bot mode is the default:

```env
TELEGRAM_BOT_USERNAME="eco_bright_bot"
TELEGRAM_ORDER_TARGET="eco_bright_sale_bot"
ADMIN_TELEGRAM_USER_IDS="123456789,987654321"
ADMIN_TELEGRAM_CHAT_ID=""
```

Dedicated admin bot settings are now part of the standard production setup.

Recommended business mapping:

- customer/storefront bot: `@eco_bright_bot`
- sales/support handoff: `@eco_bright_sale_bot`
- admin bot: `@eco_bright_admin_bot`
