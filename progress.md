# progress.md

## Project Status
ECO BRIGHT LED & SOLAR

## Live Flow Status
- [x] Website creates order first
- [x] Neon is source of truth
- [x] Telegram is interaction layer
- [x] Deeplink restore is supported
- [x] Pasted-link flow is supported
- [x] Guided checkout is supported
- [x] Admin review flow exists
- [x] Confirm is idempotent
- [x] Sessions support resume and cancel
- [x] Admin actions enforce state transitions

## Bot Mapping
- [x] `@eco_bright_bot` documented as the main customer bot
- [x] `@eco_bright_sale_bot` documented as the sales/support handoff target
- [x] `@eco_bright_admin_bot` documented as the reserved future admin bot
- [x] responsibility split documented as conversion / communication / operations

## Memory Docs
- [x] `Codex.md`
- [x] `architecture.md`
- [x] `workflow.md`
- [x] `progress.md`
- [x] `docs/telegram-bots/README.md`
- [x] `docs/telegram-bots/customer/README.md`
- [x] `docs/telegram-bots/admin/README.md`
- [x] `docs/telegram-bots/sales-team/README.md`
- [x] `docs/telegram-bots/menu-tree.md`
- [x] `docs/telegram-bots/message-copy.md`

## Implementation Notes
- [x] Customer bot keeps draft state before final review
- [x] Final confirm is idempotent
- [x] Admin actions reload latest Neon state
- [x] Status history is tracked
- [x] Telegram identity is stored on orders
- [x] Deeplink payloads can expire

## UX Notes
- [x] Mobile-first ordering flow
- [x] Desktop invoice rail
- [x] Copy/share/Telegram handoff
- [x] Empty and error states exist
- [x] Telegram main menu, search, cart, and order lookup flow
- [ ] Printable invoice mode

## Current Focus
- [x] Keep docs and memory aligned with the live flow
- [x] Keep the separate customer, sales, and admin bot runtimes aligned
- [x] Keep the 3-bot ownership model explicit in docs and config
- [x] Separate admin bot runtime is wired

## Done Criteria
- [x] No TypeScript errors in the documented live flow
- [x] No unsafe browser API usage on server
- [x] No duplicate order confirmation side effects
- [x] Docs describe the current live flow clearly
