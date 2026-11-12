---
name: nextjs-app-router
description: Use when adding or changing pages, layouts, loading/error states, metadata/SEO (generateMetadata, sitemap, robots, OG images), or server/client component boundaries in this Next.js 16 App Router storefront (src/app, src/components).
---

# Next.js 16 App Router — eco-bright conventions

This project runs **Next.js 16.2 / React 19.2**. Training data may describe older APIs. Before using an API you're unsure of, read the version-matched docs:

- `node_modules/next/dist/docs/01-app/01-getting-started/` — layouts/pages, server & client components, fetching, caching, errors, metadata & OG images, route handlers, proxy
- `node_modules/next/dist/docs/01-app/03-api-reference/` — exact signatures (`generateMetadata`, `sitemap.ts`, `robots.ts`, `opengraph-image`, `notFound`, …)

## Route files

- `page.tsx` / `layout.tsx` stay thin: await params, call a loader, pass data to a component. Business logic lives in `src/lib/*`.
- Pages are **Server Components**. Never put `"use client"` on a `page.tsx` or `layout.tsx`; push it down to the smallest interactive component (e.g. `ProductDetailClient`, `AddToCartButton`).
- Add `loading.tsx` / `error.tsx` per segment where data loads (see `src/app/products/`). `error.tsx` must be a client component.

## Async request APIs (Next 15+)

`params`, `searchParams`, `cookies()`, `headers()` are Promises. Follow the existing pattern:

```tsx
type Params = Promise<{ id: string }>;

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = getPublicProductOrNotFound(await getProductById(id));
  const locale = await getRequestLocale();
  // ...
}
```

`searchParams` type: `Promise<{ [key: string]: string | string[] | undefined }>`.

## Data loading

- Products: `getProductById` / list helpers in `src/lib/db/products.ts` (`server-only`, raw neon SQL) → map with `getPublicProductOrNotFound` from `src/lib/public-products.ts`, which calls `notFound()` for missing/hidden products.
- Orders: Drizzle query modules in `src/db/queries/*` via `getDb()`.
- Never import `src/db/*`, `src/lib/db/*`, `locale-server.ts` or anything with `import "server-only"` into a client component. Pass serializable props instead.
- Cache Components / `"use cache"` are not enabled; don't add them without asking. Routes that read cookies (locale) are dynamic already.

## Localization (km / en)

- Locale comes from a cookie: `getRequestLocale()` (server, `src/lib/locale-server.ts`) or the `LocaleProvider` context (client).
- Products carry `titleKm`, `descriptionKm`, `categoryLabelKm`, `useCaseKm`; pick with `localizeText(locale, en, km)` from `src/lib/i18n.ts`.
- Khmer text uses the `--font-noto-sans-khmer` variable set in `layout.tsx`.

## Metadata / SEO

- Root `metadata` in `src/app/layout.tsx` sets `metadataBase` from `NEXT_PUBLIC_SITE_URL` and a `%s | SHOP_NAME` title template — child titles should not repeat the shop name unless they bypass the template with `title: { absolute: ... }`.
- Dynamic pages use `generateMetadata({ params })`; reuse the same loader as the page (requests are per-render, so calling it twice is acceptable; wrap in React `cache()` if it becomes costly).
- OG/Twitter image URLs must be absolute for crawlers; relative URLs resolve against `metadataBase`. Product images may be on external hosts (see `next.config.ts` `remotePatterns`).
- `sitemap.ts` / `robots.ts` go in `src/app/` and return `MetadataRoute.Sitemap` / `MetadataRoute.Robots`.

## Client components

- Cart state: Zustand `src/store/cart-store.ts`, hydrated by `CartHydrator`. Read `localStorage` only in effects/client code, inside try/catch.
- UI primitives: `src/components/ui/*` (cva + `tailwind-merge`, `cn` from `src/lib/utils.ts`). Icons from `lucide-react`.
- Mobile-first; keep invoice/cart rail from covering content on small screens.

## Done checklist

- [ ] No `"use client"` on pages/layouts; server-only modules not imported by client code
- [ ] All `params`/`searchParams`/`cookies()` awaited
- [ ] Loading + error + empty states handled
- [ ] Both km and en render
- [ ] `npm run check` passes
