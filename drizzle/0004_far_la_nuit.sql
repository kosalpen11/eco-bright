ALTER TABLE "order_items" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "telegram_message" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "source" text DEFAULT 'web' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;