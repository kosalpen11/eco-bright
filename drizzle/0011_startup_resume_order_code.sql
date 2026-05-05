ALTER TABLE "orders" ADD COLUMN "order_code" text;
ALTER TABLE "orders" ADD COLUMN "telegram_user_id" text;
ALTER TABLE "orders" ADD COLUMN "telegram_username" text;

ALTER TABLE "telegram_sessions" ADD COLUMN "resume_order_id" uuid;
ALTER TABLE "telegram_sessions" ADD COLUMN "resume_order_code" text;
ALTER TABLE "telegram_sessions" ADD COLUMN "last_start_payload" text;

ALTER TABLE "telegram_sessions"
  ADD CONSTRAINT "telegram_sessions_resume_order_id_orders_id_fk"
  FOREIGN KEY ("resume_order_id") REFERENCES "public"."orders"("id")
  ON DELETE set null ON UPDATE no action;

CREATE UNIQUE INDEX "orders_order_code_unique" ON "orders" USING btree ("order_code");
CREATE INDEX "orders_telegram_user_id_idx" ON "orders" USING btree ("telegram_user_id");
CREATE INDEX "telegram_sessions_resume_order_code_idx" ON "telegram_sessions" USING btree ("resume_order_code");

UPDATE "orders"
SET
  "telegram_user_id" = COALESCE("telegram_user_id", "telegram_customer_user_id"),
  "telegram_username" = COALESCE("telegram_username", "telegram_customer_username")
WHERE "telegram_user_id" IS NULL OR "telegram_username" IS NULL;

UPDATE "telegram_sessions"
SET "resume_order_id" = COALESCE("resume_order_id", "draft_order_id")
WHERE "resume_order_id" IS NULL AND "draft_order_id" IS NOT NULL;
