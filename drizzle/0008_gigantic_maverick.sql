CREATE TABLE "order_id_sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL,
	"last_generated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "short_order_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_code" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "fulfillment_method" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "telegram_user_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "telegram_username" text;--> statement-breakpoint
ALTER TABLE "telegram_sessions" ADD COLUMN "resume_order_id" uuid;--> statement-breakpoint
ALTER TABLE "telegram_sessions" ADD COLUMN "resume_order_code" text;--> statement-breakpoint
ALTER TABLE "telegram_sessions" ADD COLUMN "last_start_payload" text;--> statement-breakpoint
ALTER TABLE "telegram_sessions" ADD CONSTRAINT "telegram_sessions_resume_order_id_orders_id_fk" FOREIGN KEY ("resume_order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_short_order_id_unique" UNIQUE("short_order_id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_code_unique" UNIQUE("order_code");