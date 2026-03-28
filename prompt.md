# prompt.md

## Continuation Prompt
Continue building the ECO BRIGHT LED & SOLAR Next.js storefront.
Follow `architecture.md`, `CLAUDE.md`, and `SKILL-nextjs-storefront.md`.
Keep the implementation modular, typed, mobile-first, and production-ready.

## Bug Fix Prompt
Act as a senior Next.js engineer. Fix the bug without changing working behavior unnecessarily.
Check cart persistence, invoice totals, QR payload correctness, client/server boundary issues, and Web Share fallback.
Return root cause, fix summary, and final code changes.

## Feature Add Prompt
Add the new feature without breaking storefront, cart, invoice, or QR flows.
Reuse existing types and utilities.
Do not duplicate logic.
Update docs and checklists if behavior changes.

## Refactor Prompt
Refactor the storefront to improve structure without changing user-visible behavior.
Keep the cart, invoice, QR, Telegram, and share flows intact.
Prefer smaller files, pure helpers, and reusable components.
