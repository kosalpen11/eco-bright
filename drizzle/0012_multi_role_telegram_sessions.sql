ALTER TABLE "telegram_sessions" ADD COLUMN "bot_role" text DEFAULT 'customer' NOT NULL;
ALTER TABLE "telegram_sessions" ADD COLUMN "telegram_chat_id" text;
ALTER TABLE "telegram_sessions" ADD COLUMN "language" text;
ALTER TABLE "telegram_sessions" ADD COLUMN "pending_admin_action" text;

ALTER TABLE "telegram_sessions"
  DROP CONSTRAINT IF EXISTS "telegram_sessions_telegram_user_id_unique";

DROP INDEX IF EXISTS "telegram_sessions_telegram_user_id_unique";

CREATE UNIQUE INDEX "telegram_sessions_role_user_unique"
  ON "telegram_sessions" USING btree ("bot_role", "telegram_user_id");

CREATE INDEX "telegram_sessions_role_step_idx"
  ON "telegram_sessions" USING btree ("bot_role", "current_step");

UPDATE "telegram_sessions"
SET
  "language" = COALESCE("language", "session_json" ->> 'language'),
  "pending_admin_action" = COALESCE("pending_admin_action", "session_json" ->> 'pendingAction')
WHERE "language" IS NULL OR "pending_admin_action" IS NULL;
