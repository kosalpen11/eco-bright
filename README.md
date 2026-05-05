# ECO BRIGHT LED & SOLAR

Production-ready Next.js storefront for browsing LED and solar products, building a live invoice, encoding it as a QR payload, and handing it off through Telegram. Neon serverless Postgres is the source of truth for products, orders, and order items.

This repo now includes a staged monorepo foundation for a Telegram bot runtime,
shared backend packages, and future API/admin extraction.

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Zustand for cart state
- `react-qr-code` for QR rendering
- Lucide icons
- Framer Motion for light animation

## Features
- Premium dark eco-tech storefront UI
- Neon-backed product catalog with typed query mapping
- Search by title, category, description, use case, and tags
- Filter by category
- Group by category, price range, or use case
- Sort by featured, newest, rating, or price
- Local cart persistence with hydration-safe storage guards
- Stable invoice session ids with live totals and timestamps
- Desktop wide sticky invoice rail
- Large-screen two-column catalog plus invoice layout
- Mobile fixed summary bar with bottom sheet drawer
- Structured QR payload that updates with the cart
- Readable invoice text for copy/share
- Web Share fallback to clipboard copy
- Neon-backed order + order item persistence with pending status
- Telegram chat or bot deep-link handoff after order creation
- Pasted product-link resolution for quick ordering
- Admin Telegram review flow with accept, reject, clarification, processing, complete, cancel, custom reason, and notes
- Auditable order status history in Neon

## Scripts
```bash
npm run dev
npm run bot:dev
npm run bot:watch
npm run build
npm run build:all
npm run start
npm run lint
npm run lint:all
npm run typecheck
npm run typecheck:all
npm run check
npm run test:catalog
npm run db:generate
npm run db:push
npm run seed:products
npm run import:products:csv -- ./products.csv
npm run validate:products -- ./products.csv
npm run report:products -- ./products.csv
```

## Local Development
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment
Copy `.env.example` to `.env.local` and fill in values as needed.

```bash
cp .env.example .env.local
```

Public storefront settings:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SHOP_NAME`
- `NEXT_PUBLIC_TELEGRAM_URL`
- `NEXT_PUBLIC_DEFAULT_CURRENCY`

Server-only settings:
- `DATABASE_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_BOT_USERNAME`
- `TELEGRAM_ORDER_TARGET`
- `TELEGRAM_SUPPORT_TARGET`
- `ADMIN_TELEGRAM_USER_IDS`
- `ADMIN_TELEGRAM_CHAT_ID`

Optional advanced overrides:
- `TELEGRAM_ADMIN_BOT_TOKEN`
- `TELEGRAM_ADMIN_BOT_USERNAME`

`DATABASE_URL` must stay server-side only.
Do not place API keys, database credentials, or tokens in any `NEXT_PUBLIC_*` variable because those values are exposed in the browser bundle.
For Netlify, you usually need `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, and optionally `TELEGRAM_ORDER_TARGET` / `TELEGRAM_BOT_USERNAME` if you want Telegram handoff controlled server-side.

Recommended 3-bot setup:

```env
TELEGRAM_BOT_TOKEN=""
TELEGRAM_BOT_USERNAME="eco_bright_bot"
TELEGRAM_SALES_BOT_TOKEN=""
TELEGRAM_ORDER_TARGET="eco_bright_sale_bot"
TELEGRAM_ADMIN_BOT_TOKEN=""
TELEGRAM_ADMIN_BOT_USERNAME="eco_bright_admin_bot"
ADMIN_TELEGRAM_USER_IDS="123456789,987654321"
ADMIN_TELEGRAM_CHAT_ID=""
```

Use Telegram usernames in env values, not display names, and omit the leading `@`.
Example: `eco_bright_bot`, not `eco-bright-bot`.

Recommended concrete bot mapping for this business:

- customer/storefront bot: `@eco_bright_bot`
- sales/support handoff: `@eco_bright_sale_bot`
- admin bot: `@eco_bright_admin_bot`

Recommended responsibility split:

- customer bot = conversion
- sales bot = communication
- admin bot = operations
- Neon DB = source of truth

## Project Structure
```txt
apps/
  api/
  telegram-bot/
  web/
packages/
  catalog-core/
  config/
  db/
  order-core/
  shared/
  telegram-core/
src/
  app/
  components/
  data/
  db/
  lib/
  store/
  types/
scripts/
  seed-products.ts
  import-products-from-csv.ts
  validate-products.ts
  export-review-report.ts
docs/
  architecture.md
  workflow.md
  telegram-flow.md
```

## Telegram Bot

- `apps/telegram-bot/src/customer-bot.ts` starts the customer bot runtime.
- `apps/telegram-bot/src/sales-bot.ts` starts the sales bot runtime.
- `apps/telegram-bot/src/admin-bot.ts` starts the admin bot runtime.
- `apps/telegram-bot/src/bot.ts` stays as a backward-compatible alias to the customer runtime.
- `apps/telegram-bot/src/handlers/` contains command and callback handlers.
- `apps/telegram-bot/src/flows/` owns deeplink restore and guided purchase steps.
- `apps/telegram-bot/src/handlers/admin.ts` owns admin-only queue and inline review actions.
- `apps/telegram-bot/src/services/admin-order-service.ts` orchestrates admin authorization, prompt state, and order review rendering.
- `packages/telegram-core/` owns Telegram deeplink, customer message helpers, admin order messages, admin keyboard payloads, and notification helpers.
- `packages/order-core/` owns draft/finalize/status logic plus admin transition services for the bot and future API/admin flows.
- `src/db/queries/telegram-sessions.ts` persists bot session state and deeplink references in Neon.

Operational bot boundaries:

- `@eco_bright_bot` handles customer conversion:
  - `/start`
  - product deeplink restore
  - paste link
  - browse/search
  - cart
  - pickup or delivery
  - confirm order
  - resume order
- `@eco_bright_sale_bot` handles human follow-up:
  - order-aware support restore
  - stock questions
  - delivery or pickup clarification
  - after-order communication
- `@eco_bright_admin_bot` handles internal operations:
  - new order review
  - accept/reject/clarify
  - processing/completed/cancelled
  - custom reason and internal notes

Telegram bot docs:

- [Telegram Bot Docs Index](/Users/kosalpen/Documents/eco-bright/docs/telegram-bots/README.md)
- [Current Live Flow](/Users/kosalpen/Documents/eco-bright/docs/current-live-flow.md)
- [Customer Bot README](/Users/kosalpen/Documents/eco-bright/docs/telegram-bots/customer/README.md)
- [Admin Bot README](/Users/kosalpen/Documents/eco-bright/docs/telegram-bots/admin/README.md)
- [Sales Team Guide](/Users/kosalpen/Documents/eco-bright/docs/telegram-bots/sales-team/README.md)

## Neon Setup
1. Create a Neon project and copy the pooled `DATABASE_URL`.
2. Put it in `.env.local`.
3. Push the schema with `npm run db:push`.
4. Seed the catalog with `npm run seed:products`.
5. Use `npm run import:products:csv -- ./products.csv` for initial catalog migration from CSV exports.

## Catalog Migration Pipeline
The catalog migration flow now uses a two-layer import model:

1. Raw CSV rows are preserved for auditability in `product_migration_rows`.
2. Normalized storefront-safe rows are upserted into `products`.
3. Review-sensitive fields such as category, title cleanup, images, alternate prices, and duplicates are flagged instead of silently coerced.

Recommended workflow:

```bash
npm run validate:products -- /Users/kosalpen/Documents/grace_products_migration.csv
npm run report:products -- /Users/kosalpen/Documents/grace_products_migration.csv
npm run import:products:csv -- /Users/kosalpen/Documents/grace_products_migration.csv --target=sheets
npm run import:products:csv -- /Users/kosalpen/Documents/grace_products_migration.csv --target=neon --apply
```

Outputs:
- `validate:products` writes `profile.json` under `artifacts/catalog-migration/<batch-id>/`
- `report:products` writes `review-summary.md`, `review-rows.csv`, `duplicate-clusters.csv`, and `category-profile.csv`
- `import:products:csv --target=sheets --apply` writes `products.normalized.csv` and `products.review.csv`
- `import:products:csv --target=neon --apply` stages every row and upserts only non-rejected normalized products

Current Grace CSV profile:
- 215 rows parsed
- 215 blank image rows flagged for review
- 18 rows with alternate price data
- 24 exact duplicate title groups
- 13 near-duplicate clusters

Review constraints:
- blank `imageUrl` is allowed and normalized to `null`, but always flagged
- inferred or remapped categories are review-sensitive
- `price3Colors` stays in staging/review metadata only and is not imported as storefront `oldPrice`
- source metadata (`sourceSheet`, `sourceBlock`, `sourceRow`, `sourceSegment`) is preserved for traceability

Recommended install commands:

```bash
npm install @neondatabase/serverless drizzle-orm zod
npm install -D drizzle-kit dotenv tsx
```

## Key Flows
### Storefront
- `src/app/page.tsx` loads the catalog on the server.
- `src/lib/products.ts` loads the catalog from Neon through the query layer.
- `src/components/storefront/storefront-shell.tsx` owns the interactive catalog state.
- `src/components/product/product-toolbar.tsx` keeps search, filter, sort, and browse-state controls in one consistent surface.
- `src/components/product/product-empty-state.tsx` handles no-result recovery with a storefront-specific reset action.
- `src/lib/search-products.ts`, `src/lib/sort-products.ts`, and `src/lib/group-products.ts` keep product transforms pure.

### Cart
- `src/store/cart-store.ts` owns cart items, invoice session metadata, and persistence.
- `src/lib/cart-storage.ts` keeps `localStorage` reads and writes safe.

### Invoice
- `src/lib/invoice/build-invoice.ts` generates invoice ids, totals, and structured QR payload data.
- `src/lib/invoice/invoice-text.ts` formats the readable invoice body.
- `src/components/cart/invoice-panel.tsx` renders the wide desktop invoice rail and the mobile drawer content.

### Orders and Telegram
- `src/lib/validation/order.ts` validates order requests with Zod.
- `src/lib/ordering/create-order-payload.ts` builds the frontend order payload and Telegram payload shape.
- `src/lib/telegram-order/` isolates Telegram-specific order messaging, bot payload rules, config validation, and direct chat URLs.
- `src/app/api/orders/route.ts` stays thin and delegates DB persistence plus Telegram handoff preparation to the service layer, then optionally notifies the admin Telegram chat.
- `src/components/cart/order-button.tsx` creates orders from the reviewed invoice and opens the Telegram handoff.
- `src/components/cart/order-success-sheet.tsx` shows the post-order success state and Telegram actions.
- `src/components/ordering/paste-link-form.tsx` resolves pasted product links into cart items.
- `src/app/api/parse-product-link/route.ts` parses storefront product links and resolves products from Neon.

### Share
- `src/lib/share.ts` handles Web Share plus clipboard fallback.

### Database
- `src/db/client.ts` creates the Neon/Drizzle server connection.
- `src/db/schema.ts` defines `products`, `product_migration_rows`, `orders`, `order_items`, `telegram_sessions`, `deeplink_payloads`, and `order_status_history`.
- `src/db/queries/products.ts` exposes active product reads and normalized upserts.
- `src/db/queries/product-migration-rows.ts` stages raw and normalized migration rows for auditability.
- `src/db/queries/orders.ts` writes orders and order items in a single transaction, logs creation + admin history, and supports guarded status updates.
- `src/db/mappers/product-row-to-product.ts` keeps DB rows separate from UI-facing product types.
- `src/db/mappers/migration-row-to-product.ts` maps normalized migration rows into staging, Neon, and Google Sheets shapes.
- `src/app/api/products/route.ts` and `src/app/api/orders/route.ts` stay thin and call the query layer only.

## Admin Telegram Review Flow
1. Customer creates an order from the web storefront or customer bot.
2. The order is persisted in Neon first.
3. If `ADMIN_TELEGRAM_CHAT_ID` is configured, the system sends the order summary to the admin Telegram chat with inline actions through the admin bot runtime.
4. Authorized admins listed in `ADMIN_TELEGRAM_USER_IDS` can use `/admin`, review buttons, and free-text follow-ups.
5. Admin actions run through the shared order-core status machine and write `order_status_history`.

Supported admin statuses:
- `draft`
- `pending`
- `accepted`
- `rejected`
- `needs_clarification`
- `processing`
- `completed`
- `cancelled`

Recommended setup:
1. Run `npm run db:push`.
2. Set `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, and `TELEGRAM_ORDER_TARGET` for the customer and sales mapping. The current recommended values are `eco_bright_bot` and `eco_bright_sale_bot`.
3. Set `TELEGRAM_SALES_BOT_TOKEN` for the sales bot runtime.
3. Set `ADMIN_TELEGRAM_USER_IDS` to a comma-separated allowlist of operator Telegram user ids.
4. Set `ADMIN_TELEGRAM_CHAT_ID` to the staff group or direct admin chat where new orders should appear.
5. Set `TELEGRAM_ADMIN_BOT_TOKEN` and `TELEGRAM_ADMIN_BOT_USERNAME` for the admin bot runtime.
6. Start the bots with `npm run bot:customer:dev`, `npm run bot:sales:dev`, and `npm run bot:admin:dev`.

## Notes for Future Backend Integration
The current app stays Telegram-first for the user-facing order handoff. For V2, keep the client flows intact and extend the server-side integration layer:

1. Add customer fields before Telegram handoff or order persistence.
2. Add Telegram bot backend handling for `start` payload lookup by invoice or order id.
3. Use CSV import for first-time catalog migration into Neon.
4. Build a future admin dashboard on top of the same `src/db/queries/*` layer.

## Repo Docs
- [CLAUDE.md](/Users/kosalpen/Documents/eco-bright/CLAUDE.md)
- [SKILL-nextjs-storefront.md](/Users/kosalpen/Documents/eco-bright/SKILL-nextjs-storefront.md)
- [architecture.md](/Users/kosalpen/Documents/eco-bright/architecture.md)
- [workflow.md](/Users/kosalpen/Documents/eco-bright/workflow.md)
- [progress.md](/Users/kosalpen/Documents/eco-bright/progress.md)
- [prompt.md](/Users/kosalpen/Documents/eco-bright/prompt.md)
- [qa-checklist.md](/Users/kosalpen/Documents/eco-bright/qa-checklist.md)
- [NETLIFY_DEPLOY.md](/Users/kosalpen/Documents/eco-bright/NETLIFY_DEPLOY.md)
- [docs/telegram-bots/README.md](/Users/kosalpen/Documents/eco-bright/docs/telegram-bots/README.md)
