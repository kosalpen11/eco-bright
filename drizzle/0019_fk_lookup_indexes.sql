-- Indexes for foreign-key lookups that currently fall back to a full table scan.
-- order_items / order_status_history / order_notes are read by order_id on every order view,
-- invoice build and admin action; products.category_id is joined on every catalog query.
-- All additive (IF NOT EXISTS); tables are small, so the build lock is momentary.
-- Reverse with drizzle/0019_fk_lookup_indexes.down.sql.
BEGIN;
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);
CREATE INDEX IF NOT EXISTS order_status_history_order_id_created_at_idx ON order_status_history (order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS order_notes_order_id_idx ON order_notes (order_id);
CREATE INDEX IF NOT EXISTS products_active_category_id_idx ON products (is_active, category_id);
COMMIT;
