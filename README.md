# ECO BRIGHT LED & SOLAR

Production-ready Next.js storefront for browsing LED and solar products, building a live invoice, encoding it as a QR payload, and handing it off through Telegram. Neon serverless Postgres is the source of truth for products, orders, and order items.

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
- Telegram deep-link handoff plus direct Telegram CTA
- Server-side Neon order persistence for finalized invoices

## Scripts
```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run check
npm run db:generate
npm run db:push
npm run seed:products
npm run import:products:csv -- ./products.csv
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
- `NEXT_PUBLIC_SHOP_NAME`
- `NEXT_PUBLIC_ORDER_TELEGRAM_URL`
- `NEXT_PUBLIC_TELEGRAM_CHECKOUT_URL`
- `NEXT_PUBLIC_DEFAULT_CURRENCY`

Server-only database setting:
- `DATABASE_URL`

`DATABASE_URL` must stay server-side only.

## Project Structure
```txt
src/
  app/
    api/
  components/
    cart/
    common/
    layout/
    product/
    storefront/
    ui/
  data/
  db/
  lib/
  store/
  types/
scripts/
  seed-products.ts
  import-products-from-csv.ts
```

## Neon Setup
1. Create a Neon project and copy the pooled `DATABASE_URL`.
2. Put it in `.env.local`.
3. Push the schema with `npm run db:push`.
4. Seed the catalog with `npm run seed:products`.
5. Use `npm run import:products:csv -- ./products.csv` for initial catalog migration from CSV exports.

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
- `src/lib/search-products.ts`, `src/lib/sort-products.ts`, and `src/lib/group-products.ts` keep product transforms pure.

### Cart
- `src/store/cart-store.ts` owns cart items, invoice session metadata, and persistence.
- `src/lib/cart-storage.ts` keeps `localStorage` reads and writes safe.

### Invoice
- `src/lib/invoice/build-invoice.ts` generates invoice ids, totals, and structured QR payload data.
- `src/lib/invoice/invoice-text.ts` formats the readable invoice body.
- `src/components/cart/invoice-panel.tsx` renders the wide desktop invoice rail and the mobile drawer content.

### Share and Telegram
- `src/lib/share.ts` handles Web Share plus clipboard fallback.
- `src/lib/telegram/telegram.ts` formats the Telegram-ready handoff message and deep link.

### Database
- `src/db/client.ts` creates the Neon/Drizzle server connection.
- `src/db/schema.ts` defines `products`, `orders`, and `order_items`.
- `src/db/queries/products.ts` exposes active product reads and upserts.
- `src/db/queries/orders.ts` validates order payloads and writes orders in a transaction.
- `src/db/mappers/product-row-to-product.ts` keeps DB rows separate from UI-facing product types.
- `src/app/api/products/route.ts` and `src/app/api/orders/route.ts` stay thin and call the query layer only.

## Notes for Future Backend Integration
The current app stays Telegram-first for the user-facing order handoff. For V2, keep the client flows intact and extend the server-side integration layer:

1. Wire the invoice actions to `POST /api/orders` with duplicate-submission protection.
2. Add customer fields before Telegram handoff or order persistence.
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
