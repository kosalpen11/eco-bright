-- Reverses drizzle/0020_align_order_tables.sql: drops the code-shaped order tables and recreates the
-- previous (empty) live design exactly as it was on 2026-11-13, including its 0019 lookup indexes.
-- Aborts if the new order tables hold any row, so real orders are never thrown away.
BEGIN;

DO $$
DECLARE n bigint;
BEGIN
  SELECT (SELECT count(*) FROM orders) + (SELECT count(*) FROM order_items)
       + (SELECT count(*) FROM order_status_history) + (SELECT count(*) FROM telegram_sessions)
       + (SELECT count(*) FROM deeplink_payloads) + (SELECT count(*) FROM order_id_sequences)
    INTO n;
  IF n > 0 THEN
    RAISE EXCEPTION 'Order/bot tables hold % row(s); refusing to roll back', n;
  END IF;
END $$;

DROP TABLE telegram_sessions;
DROP TABLE deeplink_payloads;
DROP TABLE order_id_sequences;
DROP TABLE order_status_history;
DROP TABLE order_items;
DROP TABLE orders;

CREATE TABLE orders (
  id text PRIMARY KEY,
  order_code text NOT NULL,
  invoice_id text,
  customer_id text,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_telegram text,
  status text NOT NULL DEFAULT 'pending',
  fulfillment_type text NOT NULL,
  delivery_address text,
  total_amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL
);
CREATE UNIQUE INDEX orders_invoice_id_key ON orders (invoice_id);
CREATE UNIQUE INDEX orders_order_code_key ON orders (order_code);
CREATE INDEX orders_order_code_idx ON orders (order_code);
CREATE INDEX orders_status_idx ON orders (status);

CREATE TABLE order_items (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES orders (id) ON UPDATE CASCADE ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES products (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  variant_id text REFERENCES product_variants (id) ON UPDATE CASCADE ON DELETE SET NULL,
  title text NOT NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD'
);
CREATE INDEX order_items_order_id_idx ON order_items (order_id);

CREATE TABLE order_status_history (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES orders (id) ON UPDATE CASCADE ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by_id text REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL,
  reason text,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX order_status_history_order_id_created_at_idx ON order_status_history (order_id, created_at DESC);

CREATE TABLE order_notes (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES orders (id) ON UPDATE CASCADE ON DELETE CASCADE,
  author_role text NOT NULL,
  author_name text,
  note_text text NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX order_notes_order_id_idx ON order_notes (order_id);

COMMIT;
