# CLAUDE.md

Guidance for Claude Code in this repo. Project rules live in [Codex.md](Codex.md) — read it; this file only summarizes and points.

## Project

ECO BRIGHT LED & SOLAR: a Next.js storefront (Khmer + English) where customers build a cart, the **website creates the order first**, Neon Postgres stores it as the **source of truth**, and Telegram bots handle checkout, sales chat and admin review.

Stack: Next.js **16.2** App Router · React 19.2 · TypeScript (strict) · Tailwind CSS v4 · Zustand (cart) · Zod v4 · Drizzle ORM + `@neondatabase/serverless` · grammY bots · Turbo workspaces. Node 20 (`.nvmrc`), npm.

## Next.js 16 — read the bundled docs

This Next.js version is newer than most training data. Before writing routing, data-fetching, caching, metadata, proxy or route-handler code, read the matching page in `node_modules/next/dist/docs/` (`01-app/01-getting-started`, `01-app/02-guides`, `01-app/03-api-reference`). Key differences:
- `params`, `searchParams`, `cookies()`, `headers()` are **async** — always `await` them (`type Params = Promise<{ id: string }>`).
- `middleware.ts` is now `proxy.ts` (none exists here yet).
- Cache Components / `"use cache"` are **not** enabled in this repo; don't introduce them without asking.

See the `nextjs-app-router` and `nextjs-api-route` skills in `.claude/skills/`.

## Commands

```bash
npm run dev                 # Next dev server, http://localhost:3000
npm run check               # lint + typecheck — run before finishing any change
npm run lint
npm run typecheck
npm run test:catalog        # node:test via tsx, src/lib/catalog/*.test.ts
npm run test:orders         # src/db/queries/*.test.ts
npm run build
npm run db:generate         # drizzle-kit: create SQL migration from src/db/schema.ts
npm run db:push             # apply schema to the DB in DATABASE_URL — ask first
npm run bot:customer:dev    # also bot:sales:dev, bot:admin:dev, bot:dev; *:watch variants
```

Run a single test file: `npx tsx --test src/lib/catalog/validation.test.ts`.

## Layout

```txt
src/app/                     App Router
  layout.tsx                 root metadata, fonts, locale cookie, providers
  page.tsx, products/, products/[id]/, catalog/[brand]/
  api/orders/                POST create order (idempotent by invoiceId)
  api/orders/[shortOrderId]/ order lookup
  api/products/, api/parse-product-link/, api/locale/
src/components/<domain>/     catalog, cart, ordering, product, layout, locale, theme, ui (shadcn-style primitives)
src/lib/                     pure helpers + server loaders
  db/products.ts             server-only product reads (raw neon sql)
  public-products.ts         maps DB product → PublicProduct, notFound() on missing
  ordering/, telegram-order/, validation/, invoice/, catalog/
  i18n.ts, locale.ts, locale-server.ts (km/en via cookie)
src/db/                      Drizzle: schema.ts, client.ts (getDb), queries/*
src/store/cart-store.ts      Zustand cart
src/types/                   shared TS types
packages/                    order-core (status machine, invoice), telegram-core, catalog-core, db, config, shared
apps/telegram-bot/           grammY customer / sales / admin bots
drizzle/                     generated SQL migrations + meta — don't hand-edit snapshots
scripts/                     product import / validation / image tooling (tsx)
```

Path alias: `@/*` → `src/*`. Packages are imported by relative path (e.g. `../../../../packages/config/src`), not by package name.

## Rules (summary of Codex.md / SKILL-nextjs-storefront.md)

- Server Components by default; `"use client"` only for interactive leaves. Pages and layouts stay thin.
- Route handlers stay thin: validate with Zod, call query modules / shared packages, return JSON.
- Query modules (`src/db/queries`, `src/lib/db`) own DB access. Mark server-only modules with `import "server-only"`.
- `packages/order-core` owns order lifecycle and the status state machine; never duplicate order logic across web, bots and admin.
- Order confirm is idempotent; admin actions reload the latest order from Neon before any transition.
- Cart/localStorage reads happen only in client code, wrapped in try/catch; malformed storage = empty state.
- Mobile-first UI; explicit, recoverable error and empty states. Keep Telegram copy short and button-first.
- Don't change live behavior (flow, buttons, statuses, bot mapping) unless asked.

## Secrets and env

- Never read, print or commit `.env` / `.env.local`. Use `.env.example` for variable names.
- Secrets never go in `NEXT_PUBLIC_*`; only `NEXT_PUBLIC_SITE_URL`, `_SHOP_NAME`, `_TELEGRAM_URL`, `_DEFAULT_CURRENCY` are public.
- Use `getRequiredEnv()` from `src/lib/utils/env.ts` for required server env.

## Docs that must stay in sync

If you change flow, buttons, status logic, bot mapping or docs structure, update in the same change: `Codex.md`, `architecture.md`, `workflow.md`, `progress.md`, `docs/telegram-bots/*`. Reusable review prompts live in `agents/`.

## Before finishing

1. `npm run check` passes.
2. Run the relevant test script if you touched `src/lib/catalog` or `src/db/queries`.
3. For UI changes, check mobile and desktop widths in the browser (`npm run dev`).
4. Don't commit unless asked.
