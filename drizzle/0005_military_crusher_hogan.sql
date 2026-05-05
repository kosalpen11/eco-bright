CREATE TABLE "deeplink_payloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payload_type" text NOT NULL,
	"payload_json" jsonb NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_user_id" text NOT NULL,
	"username" text,
	"current_step" text DEFAULT 'idle' NOT NULL,
	"source" text DEFAULT 'telegram-bot' NOT NULL,
	"draft_order_id" uuid,
	"last_payload_reference_id" uuid,
	"session_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "telegram_sessions_telegram_user_id_unique" UNIQUE("telegram_user_id")
);
--> statement-breakpoint
ALTER TABLE "telegram_sessions" ADD CONSTRAINT "telegram_sessions_draft_order_id_orders_id_fk" FOREIGN KEY ("draft_order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telegram_sessions" ADD CONSTRAINT "telegram_sessions_last_payload_reference_id_deeplink_payloads_id_fk" FOREIGN KEY ("last_payload_reference_id") REFERENCES "public"."deeplink_payloads"("id") ON DELETE set null ON UPDATE no action;