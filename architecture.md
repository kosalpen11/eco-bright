# architecture.md

## Overview
ECO BRIGHT LED & SOLAR is a Neon-backed storefront. The UI owns browsing, carting, invoice generation, QR encoding, and Telegram handoff. Database access stays behind server-side query modules and route handlers so catalog and order persistence stay isolated from the UI layer.

## Data Flow
1. The app loads product data from Neon through a server-side query layer
2. The user searches, filters, groups, and sorts products
3. The user adds products to the cart
4. Zustand updates cart state and persists it locally
5. Invoice utilities derive invoice data from the cart
6. QR utilities encode the structured invoice payload
7. Share utilities create readable invoice text
8. Telegram utilities build the order handoff message or link
9. Server routes expose products and persist orders to Neon

## Cart Flow
- `ProductCard` dispatches add-to-cart actions
- `cart-store.ts` owns items, quantities, and reset logic
- Derived values such as count, subtotal, and total come from pure helpers or selectors
- Persistence must be safe if `localStorage` is unavailable or malformed

## Invoice Flow
- Convert cart items into invoice items with `lineTotal`
- Generate a stable invoice ID and timestamp
- Compute subtotal and total in one place only
- Produce both:
  - structured JSON for QR
  - human-readable text for copy/share/Telegram

## Share Flow
- Prefer Web Share API when available
- Fall back to clipboard copy
- Keep share payload human-readable first, JSON second
- Preserve Telegram as a distinct CTA

## Suggested Folder Structure
```txt
src/
  app/
    api/
      orders/route.ts
      products/route.ts
    layout.tsx
    page.tsx
    globals.css
  components/
    layout/
    product/
    cart/
    ui/
  lib/
    cart-storage.ts
    currency.ts
    schema.ts
    invoice.ts
    invoice-text.ts
    products.ts
    qr.ts
    share.ts
    telegram.ts
    utils.ts
  store/
    cart-store.ts
  types/
    product.ts
    cart.ts
    invoice.ts
    google-sheet.ts
```

## Server and Client Boundaries
- Server-safe:
  - metadata
  - product loading from Neon
  - Neon access through `src/db/*`
  - order persistence through `app/api/orders`
- Client-safe:
  - search and filters
  - cart interactions
  - invoice panel
  - QR display
  - copy/share actions
  - Telegram handoff

## Future Backend Integration
- Keep a product repository abstraction
- Keep an order sink abstraction
- Leave Neon logic behind query modules or API routes
- Add order submission wiring from UI only after deciding the desired trigger point
- Avoid coupling UI to any single data source
