# Codex.md

## Project
ECO BRIGHT LED & SOLAR is a commerce system built around a Next.js storefront, Neon as the source of truth, and Telegram as the interaction layer.

## Live Flow
- Website creates the order first.
- Neon stores products, orders, order items, deeplink payloads, sessions, and order history.
- Telegram handles deeplink restore, pasted links, guided checkout, and admin review.
- Final confirm is idempotent.
- Sessions support resume and cancel.
- Admin actions must reload latest order state and pass through the shared state machine.

## Bot Mapping
- Customer bot: `@eco_bright_bot`
- Sales/support handoff: `@eco_bright_sale_bot`
- Reserved future admin bot: `@eco_bright_admin_bot`

## Ownership Model
- Customer bot = conversion
- Sales bot = communication
- Admin bot = operations
- Neon = source of truth

## Rules
- Keep behavior stable unless the user explicitly requests a flow change.
- Treat docs and memory files as persistent project memory.
- Do not duplicate order logic across web, bot, and admin flows.
- Keep Telegram message copy short and button-first.
- Keep secrets out of `NEXT_PUBLIC_*`.
- Preserve Neon as the source of truth for order state.
- Reload the latest order before any admin transition.

## Architecture Rules
- Route handlers stay thin.
- Query modules own Neon access.
- `order-core` owns lifecycle rules and idempotency.
- `telegram-core` owns Telegram message, keyboard, and deeplink helpers.
- `catalog-core` owns product resolution and parsing.
- UI components stay presentational where possible.
- Shared utilities should be pure and easy to test.

## State Rules
- Draft before final review.
- Confirm is idempotent.
- Expired deeplink payloads must fail safely.
- Sessions must support resume, cancel, and pending admin text actions.
- Admin status updates must follow the shared state machine.

## UX Rules
- Mobile-first is required.
- Buttons-first Telegram UX.
- Invoice, QR, copy, and share should feel secondary to the order flow, not scattered.
- Error states must be explicit and recoverable.
- Empty states must guide the next action.

## Memory Files To Keep Fresh
- `architecture.md`
- `workflow.md`
- `progress.md`
- `docs/telegram-bots/README.md`
- `docs/telegram-bots/customer/README.md`
- `docs/telegram-bots/admin/README.md`
- `docs/telegram-bots/sales-team/README.md`
- `docs/telegram-bots/menu-tree.md`
- `docs/telegram-bots/message-copy.md`

## Update Rule
- If you change flow, buttons, status logic, bot mapping, or docs structure, update the matching memory docs in the same session.
