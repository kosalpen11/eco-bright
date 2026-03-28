# workflow.md

## Goal
Build the storefront in phases so the app stays type-safe, modular, and easy to continue.

## Branch Strategy
- Use a feature branch with the `codex/` prefix
- Keep each phase scoped
- Prefer small commits over a large rewrite

## Implementation Order
1. Scaffold app structure, types, and utilities
2. Build layout and storefront UI
3. Add search, filters, grouping, and sorting
4. Implement cart state and persistence
5. Implement invoice generation and invoice panel
6. Add QR, copy/share, and Telegram actions
7. Add Neon catalog and order endpoints
8. Polish mobile UX, accessibility, and docs

## Phase Checkpoints
### Foundation
- Next.js App Router exists
- TypeScript is strict
- Tailwind is configured
- Shared types are defined
- Neon product mapping is in place

### UI
- Navbar, hero, footer, and product card are reusable
- Mobile layout is clean
- Empty states look intentional

### Browse
- Search works by title, category, description, and tags
- Filters and grouping are fast
- Derived lists are memoized or derived safely

### Cart
- Add, increment, decrement, remove, and clear work
- Cart survives refresh
- Cart badge reflects item count

### Invoice
- Invoice matches the cart
- Totals stay consistent
- Invoice ID and timestamp are visible
- Desktop rail feels substantial, not cramped
- Mobile sheet keeps actions visible and QR below totals

### QR and Share
- QR updates live with cart changes
- Copy and share work or fall back cleanly
- Telegram order handoff works

### Database
- Product rows map into the shared `Product` model
- Missing database config fails safely
- Order route accepts valid invoice payloads only

### Polish
- Responsive and accessible
- No hydration issues
- README and tracker are current

## QA Checklist
- Products render
- Search works
- Filters work
- Grouping works
- Sorting works
- Cart persists
- Invoice totals are correct
- QR data is valid
- Copy and share work
- Telegram CTA works
- Desktop invoice rail width feels correct
- Mobile invoice sheet opens cleanly
- Database routes build without server/client boundary issues
- Mobile layout does not overflow
