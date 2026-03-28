CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" text NOT NULL,
	"title" text NOT NULL,
	"price" numeric NOT NULL,
	"qty" integer NOT NULL,
	"line_total" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" text NOT NULL,
	"shop" text NOT NULL,
	"currency" text NOT NULL,
	"item_count" integer NOT NULL,
	"subtotal" numeric NOT NULL,
	"total" numeric NOT NULL,
	"customer_name" text,
	"customer_phone" text,
	"note" text,
	"telegram_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_invoice_id_unique" UNIQUE("invoice_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"category_label" text NOT NULL,
	"use_case" text,
	"description" text NOT NULL,
	"image_url" text NOT NULL,
	"price" numeric NOT NULL,
	"old_price" numeric,
	"badge" text,
	"tags" text[],
	"currency" text DEFAULT 'USD' NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"sort_order" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"rating" numeric,
	"created_order" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;