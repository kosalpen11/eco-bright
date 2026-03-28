# CLAUDE.md

## Project
ECO BRIGHT LED & SOLAR is a production storefront built with Next.js App Router, TypeScript, Tailwind CSS, Zustand, Neon-backed catalog/order storage, and local cart plus invoice generation.

## Business Goals
- Sell LED and solar products through a fast storefront
- Support search, filters, grouping, and sorting
- Keep Telegram ordering as the primary handoff path
- Generate a live invoice panel with QR, copy, share, and Telegram actions
- Support Neon catalog loading and order persistence without changing the UI domain model

## Core Rules
- Keep components modular and small
- Keep cart state centralized
- Put invoice logic in pure utilities
- Put share and Telegram formatting in dedicated helpers
- Avoid duplicate transformation logic
- Prefer typed data models over inline objects
- Do not access `window`, `document`, `navigator`, or `localStorage` in server components
- Guard all browser-only APIs

## UI Rules
- Use a premium eco-tech dark theme
- Use lime and solar yellow accents
- Keep spacing generous and hierarchy clear
- Design mobile first
- Sticky invoice UI must work on small screens
- Use motion sparingly and only where it helps clarity

## State Rules
- Use Zustand for cart state
- Use selectors or pure helpers for derived values
- Persist cart safely to `localStorage`
- Handle hydration safely
- Never recompute invoice totals in multiple places

## Invoice Rules
- Invoice payload must include `invoiceId`, `createdAtIso`, `shop`, `currency`, `items`, `subtotal`, `total`, and `telegramUrl`
- Invoice items must include `id`, `title`, `price`, `qty`, and `lineTotal`
- QR payload and readable invoice text must stay data-equivalent
- Copy/share must fall back cleanly when Web Share API is unavailable

## Telegram Rules
- Telegram is the default order handoff channel for V1
- Keep the message readable for humans
- Keep the formatter reusable so it can later point to a backend order API

## Database Rules
- Neon is the product catalog source and order sink
- Keep secrets server-side only
- Never expose `DATABASE_URL` in client code
- Keep database access isolated in `src/db/` and server-only route/query layers

## Quality Bar
- No TypeScript errors
- No hydration warnings
- No unsafe browser API usage on the server
- Cart persists after refresh
- Invoice updates correctly when cart changes
- QR payload is valid and stable
- Copy/share actions degrade gracefully
- Mobile layout feels finished, not provisional
