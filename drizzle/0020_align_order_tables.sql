-- Align the live order tables with src/db/schema.ts (the website order API and the Telegram bots).
--
-- The live DB had a different, unused order design (text ids, total_amount, fulfillment_type, order_notes)
-- that no code reads or writes, and was missing order_id_sequences, deeplink_payloads, telegram_sessions.
-- Ids change from text to uuid, so the old tables are replaced rather than altered.
--
-- Safety: aborts (nothing changes) if any of the old tables holds a row.
-- Reverse with drizzle/0020_align_order_tables.down.sql (recreates the old empty tables).
BEGIN;

DO $$
DECLARE n bigint;
BEGIN
  SELECT (SELECT count(*) FROM orders) + (SELECT count(*) FROM order_items)
       + (SELECT count(*) FROM order_status_history) + (SELECT count(*) FROM order_notes)
    INTO n;
  IF n > 0 THEN
    RAISE EXCEPTION 'Order tables hold % row(s); refusing to replace them', n;
  END IF;
END $$;

DROP TABLE order_notes;
DROP TABLE order_status_history;
DROP TABLE order_items;
DROP TABLE orders;

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id text NOT NULL,
  short_order_id text,
  order_code text,
  status text NOT NULL DEFAULT 'pending',
  shop text NOT NULL,
  currency text NOT NULL,
  item_count integer NOT NULL,
  subtotal numeric NOT NULL,
  total numeric NOT NULL,
  customer_name text,
  customer_phone text,
  note text,
  fulfillment_method text,
  admin_note text,
  rejection_reason text,
  telegram_user_id text,
  telegram_username text,
  telegram_url text,
  telegram_message text,
  telegram_customer_user_id text,
  telegram_customer_username text,
  telegram_customer_chat_id text,
  accepted_at timestamptz,
  rejected_at timestamptz,
  processed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  reviewed_by_telegram_user_id text,
  reviewed_by_name text,
  source text NOT NULL DEFAULT 'web',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_invoice_id_unique UNIQUE (invoice_id),
  CONSTRAINT orders_short_order_id_unique UNIQUE (short_order_id),
  CONSTRAINT orders_order_code_unique UNIQUE (order_code)
);
-- Bot lookups ("my orders", resumable order) and the admin review queue.
CREATE INDEX orders_telegram_user_id_idx ON orders (telegram_user_id);
CREATE INDEX orders_telegram_customer_user_id_idx ON orders (telegram_customer_user_id);
CREATE INDEX orders_status_created_at_idx ON orders (status, created_at DESC);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL CONSTRAINT order_items_order_id_orders_id_fk REFERENCES orders (id) ON DELETE CASCADE,
  product_id text NOT NULL,
  title text NOT NULL,
  price numeric NOT NULL,
  qty integer NOT NULL,
  line_total numeric NOT NULL,
  image_url text,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_items_order_id_idx ON order_items (order_id);

CREATE TABLE order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL CONSTRAINT order_status_history_order_id_orders_id_fk REFERENCES orders (id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  action text NOT NULL,
  reason text,
  actor_type text NOT NULL,
  actor_id text,
  actor_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_status_history_order_id_created_at_idx ON order_status_history (order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS deeplink_payloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payload_type text NOT NULL,
  payload_json jsonb NOT NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS telegram_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_role text NOT NULL DEFAULT 'customer',
  telegram_user_id text NOT NULL,
  telegram_chat_id text,
  username text,
  language text,
  current_step text NOT NULL DEFAULT 'idle',
  pending_admin_action text,
  source text NOT NULL DEFAULT 'telegram-bot',
  draft_order_id uuid CONSTRAINT telegram_sessions_draft_order_id_orders_id_fk REFERENCES orders (id) ON DELETE SET NULL,
  resume_order_id uuid CONSTRAINT telegram_sessions_resume_order_id_orders_id_fk REFERENCES orders (id) ON DELETE SET NULL,
  resume_order_code text,
  last_payload_reference_id uuid CONSTRAINT telegram_sessions_last_payload_reference_id_deeplink_payloads_id_fk REFERENCES deeplink_payloads (id) ON DELETE SET NULL,
  last_start_payload text,
  session_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS telegram_sessions_role_user_unique ON telegram_sessions (bot_role, telegram_user_id);
CREATE INDEX IF NOT EXISTS telegram_sessions_role_step_idx ON telegram_sessions (bot_role, current_step);
CREATE INDEX IF NOT EXISTS telegram_sessions_resume_order_code_idx ON telegram_sessions (resume_order_code);

CREATE TABLE IF NOT EXISTS order_id_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  sequence integer NOT NULL DEFAULT 0,
  last_generated_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS order_id_sequences_year_idx ON order_id_sequences (year);

COMMIT;
