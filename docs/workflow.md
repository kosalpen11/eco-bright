# Implementation Workflow

1. Seed and validate products in Neon.
2. Run the storefront locally and verify order creation.
3. Start the Telegram bot with `.env.local` configured.
4. Generate product or cart deep links from shared helpers.
5. Use `telegram_sessions` to resume interrupted bot flows.
6. Finalize orders only after user confirmation.
7. Add admin/API extraction after shared package contracts stabilize.

## Suggested Commands

```bash
npm install
npm run db:push
npm run seed:products
npm run dev
npm run bot:dev
```
