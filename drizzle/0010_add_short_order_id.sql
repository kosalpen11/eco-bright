ALTER TABLE "orders" ADD COLUMN "short_order_id" text NOT NULL DEFAULT 'ECO-2026-0000';
--> statement-breakpoint
CREATE UNIQUE INDEX "orders_short_order_id_unique" on "orders" ("short_order_id");
