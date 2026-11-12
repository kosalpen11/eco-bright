---
name: drizzle-neon-migration
description: Use when changing the database schema (src/db/schema.ts), adding a Drizzle migration in drizzle/, or adding Neon query functions in src/db/queries.
---

# Drizzle + Neon schema changes

- Schema source: `src/db/schema.ts` (config in `drizzle.config.ts`, output `./drizzle`, dialect postgresql). `packages/db/src/schema.ts` is a separate (already diverged) schema used by `packages/order-core` and `packages/catalog-core`, and so by the bots — if you change a table, check whether it needs the same change there.
- Client: `getDb()` in `src/db/client.ts` (Neon `Pool` over `ws`, singleton, server-only). Product reads in `src/lib/db/products.ts` use the `neon()` HTTP SQL client instead.

## Workflow

1. Edit `src/db/schema.ts`.
2. `npm run db:generate` → new `drizzle/NNNN_*.sql` + `drizzle/meta/*`. Review the SQL; prefer additive, backward-compatible changes (nullable columns or defaults) because bots and web may deploy at different times.
3. Hand-written SQL migrations exist (e.g. `0009_add_order_id_sequences.sql`, `0014_products_full_schema.sql`); follow the numbering and never edit an already-applied migration or the `meta/*_snapshot.json` files by hand.
4. Applying to a database (`npm run db:push`) changes the DB in `DATABASE_URL` — **ask the user before running it**.
5. Update affected types in `src/types/*`, query modules, and Zod schemas in `src/lib/validation/*`.
6. `npm run check` and `npm run test:orders`.

## Query module rules

- One module per aggregate (`orders.ts`, `products.ts`, `telegram-sessions.ts`); export typed functions, not the db instance.
- Multi-row writes (order + items + history) go in a transaction.
- Map DB rows to app types inside the module; callers never see raw rows.
- Never read `.env` / `.env.local` contents; env names are in `.env.example`.
