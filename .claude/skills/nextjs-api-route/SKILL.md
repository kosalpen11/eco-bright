---
name: nextjs-api-route
description: Use when adding or changing Next.js route handlers under src/app/api (orders, products, parse-product-link, locale) or any server code that writes orders or changes order status in this project.
---

# Route handlers — eco-bright conventions

Read `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` for current Next 16 APIs. Reference implementation: `src/app/api/orders/route.ts`.

## Shape

```ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";        // Neon pool needs Node (ws)
export const dynamic = "force-dynamic"; // for anything touching orders/DB writes

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = someSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid payload",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 400 },
    );
  }
  // call query module / shared package, then:
  return NextResponse.json({ ok: true, ...result });
}
```

- Responses are `{ ok: boolean, message?, issues?, ...data }`. Use 400 for validation, 401 for failed admin auth, 404 for missing/disabled, 409 for conflicts, 500 for unexpected errors (log server-side, return a generic message).
- Dynamic route params are async: `{ params }: { params: Promise<{ shortOrderId: string }> }`.
- Feature-gate with `src/lib/feature-flags.ts` (e.g. `isOrderingEnabled()`).

## Keep handlers thin

- **Validation:** Zod v4 schemas in `src/lib/validation/*` (e.g. `createOrderRequestSchema`) or exported from the query module. Don't define large schemas inline in the handler.
- **DB access:** only through query modules — `src/db/queries/*` (Drizzle, `getDb()`) or `src/lib/db/*` (neon SQL). No SQL in handlers.
- **Order rules:** status transitions go through `packages/order-core/src/order-status-machine.ts` (`assertOrderStatusTransition`, `canTransitionOrderStatus`). Never set `status` directly.
- **Telegram:** build URLs/messages with `src/lib/telegram-order/*` and `packages/telegram-core`. Telegram notifications happen *after* the order is persisted and must not fail the request (`.catch` and log).
- Packages are imported by relative path, e.g. `await import("../../../../packages/config/src")`.

## Order invariants (from Codex.md)

- Website creates the order first; Neon is the source of truth.
- Create is **idempotent** by `invoiceId`: look up an existing order first and return it with `alreadyExists: true`; also handle Postgres unique violation `23505` (race) by re-reading and returning the existing order.
- Validate the client cart against current DB products (`validateOrderProductSnapshot`) — never trust client prices.
- Admin transitions reload the latest order before writing and write a `orderStatusHistoryTable` row.

## Security

- Never return secrets or bot tokens; never read env via `NEXT_PUBLIC_*` for secrets. Use `getRequiredEnv()` from `src/lib/utils/env.ts`.
- Bulk/admin endpoints (e.g. `api/products/images/bulk`) must check authorization before doing work (the bulk route checks an `x-admin-key` header against `ADMIN_API_KEY`).

## Done checklist

- [ ] Input validated with Zod; errors return `issues`
- [ ] DB access in a query module; status changes via order-core
- [ ] Idempotent on retries / double-submit
- [ ] `npm run check` and `npm run test:orders` pass
- [ ] If flow or status logic changed: update `Codex.md`, `architecture.md`, `workflow.md`, `progress.md`, `docs/telegram-bots/*`
