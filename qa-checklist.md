# QA Checklist

## Functional Checks
- Verify the homepage renders with the hero, product catalog, and invoice sidebar without console errors.
- Verify search matches product title, category, description, and tags, and that `/` or `Cmd/Ctrl+K` focuses the search input.
- Verify category filters, group modes, and sort modes update the product list without breaking grouping order.
- Verify product cards add items to cart and repeated clicks increase quantity instead of duplicating rows.
- Verify cart rows support increment, decrement, and remove actions and that quantities never go below zero.
- Verify the invoice updates immediately when the cart changes, including invoice ID, created timestamp, line totals, subtotal, and total.
- Verify the QR code renders from the structured invoice payload and updates whenever the cart changes.
- Verify the invoice reset action clears the cart and resets invoice state consistently.
- Verify the empty cart state is intentional and still offers a Telegram handoff CTA.

## Mobile Checks
- Verify the catalog layout remains readable on narrow screens and does not overflow horizontally.
- Verify the bottom invoice sheet is reachable on mobile and does not hide product cards or search controls.
- Verify fixed bottom invoice controls do not block tappable product content near the bottom of the viewport.
- Verify product card text, tags, and CTA buttons remain usable at common mobile widths.
- Verify the invoice scroll area can be scrolled independently when the cart is long.
- Verify the `Open Invoice` sheet opens and closes cleanly with touch input.

## Accessibility Checks
- Verify all interactive controls have usable labels, including add-to-cart, quantity controls, reset, copy, share, and Telegram buttons.
- Verify keyboard users can reach search, filters, sort controls, and cart actions in a logical order.
- Verify the search shortcut does not steal focus when typing in an input or textarea.
- Verify color contrast stays acceptable on accent text, muted text, and badge states against the dark background.
- Verify focus states are visible for buttons, selects, and the mobile sheet trigger.
- Verify the QR section is accompanied by readable invoice text so the order is not QR-only.

## Persistence / Share Checks
- Verify cart state persists across refresh after adding items, using the `localStorage` snapshot in `src/lib/cart-storage.ts`.
- Verify malformed or unavailable `localStorage` data falls back to an empty cart without breaking render.
- Verify invoice metadata survives normal cart updates and is restored after hydration.
- Verify `Copy Invoice` copies the readable invoice text, not raw JSON.
- Verify `Share Invoice` uses Web Share API when available and falls back to clipboard copy when it is not.
- Verify the Telegram share link opens a prefilled share URL and the direct Telegram CTA still works.
- Verify QR payload stays compact enough to scan after several items are added.

## Residual Risks / Future QA Notes
- `resetInvoice()` currently clears the entire cart state, so confirm that is the intended user behavior before shipping.
- `shareText()` depends on browser support and may fail silently on restricted environments, so validate clipboard fallback on Safari and mobile browsers.
- Invoice IDs use `Math.random()` plus a timestamp, which is fine for local storefront use but not deterministic enough for server-side order reconciliation.
- The catalog currently uses remote Unsplash images, so image availability and latency should be checked on slow networks.
- The mobile invoice sheet and desktop sidebar share the same invoice component, so changes to one layout path should be rechecked in both breakpoints.
- There are no automated tests for the QR payload, clipboard/share fallbacks, or mobile sheet behavior yet, so these should be covered before any backend integration work.
