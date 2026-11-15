# architecture.md

## Overview
ECO BRIGHT LED & SOLAR is a Telegram-first commerce system with a Next.js storefront, Neon as the source of truth, and a staged 3-bot operating model.

The current live flow is:
1. Website creates the order first.
2. Neon persists products, orders, order items, sessions, and order history.
3. Telegram is the interaction layer for checkout, support, and admin action.
4. Order confirmation is idempotent.
5. Sessions support resume and cancel.
6. Admin actions must reload the latest order and pass through the shared state machine.

## System Boundaries
- Web owns browsing, cart, invoice preview, QR, and order submission UX.
- Customer bot owns conversion:
  - deeplink restore
  - pasted-link flow
  - guided checkout
  - resume/cancel
- Sales bot owns human communication:
  - manual follow-up
  - special requests
  - support chat
- Admin bot owns operations:
  - order review
  - status transitions
  - custom reasons
  - internal notes
- Neon owns order persistence, status history, and payload/session references.
- Shared packages own order rules, Telegram builders, product lookup, and config.

## Data Flow
1. Product data loads from Neon or the optional Google Sheets import pipeline.
2. The user browses, searches, filters, and sorts products.
3. Cart state lives client-side and persists locally.
4. Invoice utilities derive a structured order summary.
5. `POST /api/orders` validates the request and writes the order to Neon.
6. The API returns a Telegram-ready message and URL.
7. Telegram handoff occurs after persistence succeeds.
8. Admin review actions update Neon and write history.

## Cart And Invoice Flow
- `cart-store.ts` owns items, quantities, and clearing.
- Invoice calculation is pure and shared.
- QR payloads stay compact and structured.
- Copy/share logic stays separate from Telegram handoff.

## Telegram Flow
- Customer bot `@eco_bright_bot` handles `/start`, deeplink restore, pasted links, category/search/cart UX, and checkout.
- Sales bot `@eco_bright_sale_bot` is the conversation target after order creation or when support is needed.
- Admin bot `@eco_bright_admin_bot` is the long-term operations boundary.
- Shared-bot mode still powers admin review by default until the separate admin runtime is enabled.
- Inline admin actions always reload the latest order from Neon before transition.

## Status Flow
Supported order statuses:
- `draft`
- `pending`
- `accepted`
- `rejected`
- `needs_clarification`
- `processing`
- `completed`
- `cancelled`

Rules:
- draft before final review
- confirm is idempotent
- invalid transitions are rejected by `order-core`
- custom admin text actions write history and keep the current state explicit

## Suggested Folder Structure
```txt
apps/
  web/
  telegram-bot/
  api/
packages/
  db/
  order-core/
  telegram-core/
  catalog-core/
  shared/
  config/
docs/
  telegram-bots/
scripts/
  sync-google-sheets/
```

## Server And Client Boundaries
- Server-side only:
  - Neon access
  - order persistence
  - admin action transitions
  - Telegram admin/customer notifications
- Client-side only:
  - cart interactions
  - invoice preview
  - QR display
  - copy/share actions
  - order submit button state

## Storefront URLs And SEO
- `/` 308 → `/products` (storefront home; carries Organization + WebSite JSON-LD).
- `/category/{slug}` is the only indexable filtered listing. `?category=`, old category slugs,
  `?minPrice=` and `/catalog/{brand}` 308 to the canonical shape. Filter controls build URLs with
  `buildCatalogHref` (`src/lib/catalog-url.ts`).
- Listing robots/canonical rules live in `src/lib/listing-metadata.ts`: plain first page indexable;
  page 2+ noindex,follow with a self canonical; search/brand/price/sort noindex,follow with the
  canonical on the unfiltered listing.
- `src/lib/structured-data.ts` is the one source for product name, description, price and
  availability used by page metadata, JSON-LD and `/feeds/google-merchant`, so they always match.
- `/feeds/skipped` lists products left out of the feed (and data warnings); it needs `FEED_REPORT_TOKEN`.
- `sitemap.xml` (hourly) lists `/products`, every non-empty category and every active product.

## Future Scale
- Keep order-core and telegram-core reusable for a separate admin bot or future API gateway.
- Keep product sourcing abstract so Google Sheets and Neon can coexist.
- Keep docs current when live flow or bot mapping changes.
