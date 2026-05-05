# workflow.md

## Goal
Keep implementation modular, safe, and aligned to the live flow:
- website creates order first
- Neon is source of truth
- Telegram is interaction layer
- customer bot handles conversion
- sales bot handles communication
- admin bot handles operations
- confirm is idempotent
- sessions resume/cancel cleanly
- admin actions enforce the state machine

## Branch Strategy
- Use a `codex/` feature branch
- Keep one behavior area per change
- Prefer small commits and documentation updates alongside code changes

## Implementation Order
1. Update docs and memory files when flow or bot mapping changes
2. Scaffold or refine shared types and utilities
3. Implement or adjust web UX
4. Keep invoice and order logic pure
5. Wire order persistence and Telegram handoff
6. Keep admin transitions behind shared services
7. Add QA notes and close out docs

## Phase Checkpoints
### Live Flow
- Website order creation happens before Telegram handoff
- Telegram handoff contains a stable order reference
- Drafts restore safely
- Confirm is idempotent
- Admin actions reload the latest order before writing

### Telegram
- Customer bot menu is clear and short
- Sales handoff stays separate from checkout logic
- Pasted link flow is recoverable
- Resume and cancel are explicit
- Admin review is allowlisted

### Database
- Orders and order items persist in Neon
- History rows are written for admin transitions
- Deeplink payloads can expire
- Session state survives interruptions

### UX
- Mobile is thumb-friendly
- Desktop invoice rail is not cramped
- Empty, loading, and error states are recoverable
- Copy/share/open Telegram actions are clear

## QA Checklist
- Order created before Telegram handoff
- Duplicate confirm does not duplicate side effects
- Expired deeplink fails safely
- Session resume and cancel work
- Admin actions reject invalid transitions
- Admin review reloads latest Neon state
- Current bot mapping is reflected in docs
- Role boundaries for customer, sales, and admin bots are reflected in docs
- No doc references drift from live flow

## Documentation Rule
- If a flow, bot mapping, status rule, or handler changes, update:
  - `Codex.md`
  - `architecture.md`
  - `workflow.md`
  - `progress.md`
  - `docs/telegram-bots/*`
