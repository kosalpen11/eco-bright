# Monorepo Architecture

## Current Shape

- Root app: current Next.js storefront
- `apps/telegram-bot`: Telegram bot runtime
- `apps/api`: reserved extraction target for a dedicated API service
- `packages/db`: shared Neon schema/client/query entry points
- `packages/catalog-core`: shared product lookup, search, category, and link resolution
- `packages/order-core`: draft/finalize/status logic for orders
- `packages/telegram-core`: bot deeplink and message helpers
- `packages/shared`: shared Telegram/session/order contracts
- `packages/config`: env loading and validation

## Transitional Decision

The storefront still runs from the repo root to avoid a disruptive app move in the
same change as the bot system. Shared backend logic is now being pulled into
packages so `apps/web` can become a clean extraction target later without
rewriting the bot or DB layers.

## Runtime Boundaries

- Web: browsing, cart, invoice preview, QR, order submission trigger
- DB: source of truth for products, orders, order_items, deeplink_payloads, telegram_sessions
- Bot: deeplink restore, guided purchase conversation, draft/finalize orchestration
- Shared packages: keep order/catalog/Telegram rules out of UI components and route handlers
