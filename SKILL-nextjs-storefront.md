# SKILL-nextjs-storefront.md

## Purpose
Implementation guidance for the ECO BRIGHT LED & SOLAR storefront in Next.js App Router.

## App Router Rules
- Use server components by default
- Add `use client` only for interactivity
- Keep `page.tsx` and `layout.tsx` thin
- Move business logic into `lib/`, `store/`, and `types/`
- Keep UI composition in `components/`

## Client and Server Boundaries
- Server components may fetch catalog data, generate metadata, and render static shell content
- Client components own search, filters, cart, invoice panel, QR, copy/share, and mobile interactions
- Never leak private env vars into the browser
- Never call privileged Google Sheets APIs from client code
- Prefer server-only product loaders or route handlers for Sheets-backed catalogs

## Data Rules
- Normalize all catalog data into one `Product` model
- Keep product-source-specific mapping in one place
- Keep invoice generation separate from display formatting
- Keep Telegram message formatting separate from QR payload generation

## State Rules
- Use Zustand for the cart
- Keep cart mutations small and explicit
- Prefer selectors and pure helpers for derived totals
- Hydrate from `localStorage` defensively

## UI Patterns
- Use expressive typography and strong contrast
- Keep cards reusable and responsive
- Favor clear hierarchy over decorative clutter
- Make action states obvious: add, increment, decrement, remove, share, copy

## Accessibility Checklist
- All buttons have labels
- Search is keyboard friendly
- Cart controls are focusable and obvious
- Color contrast is sufficient
- Sticky invoice does not block core content on mobile

## QR and Share Notes
- QR should encode structured invoice JSON
- Readable invoice text should be clean and compact
- Share should use Web Share API when supported
- Fallback should copy text to clipboard and surface a clear result
- Telegram handoff should remain available as a direct CTA
- Keep desktop invoice actions in a clear four-action row: copy, share, Telegram, clear

## Local Storage Safety
- Read storage only in client code
- Wrap storage parsing in try/catch
- Treat missing or malformed storage as empty state
- Never let storage failures break rendering
