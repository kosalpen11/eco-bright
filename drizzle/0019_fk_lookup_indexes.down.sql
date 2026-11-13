-- Reverses drizzle/0019_fk_lookup_indexes.sql.
BEGIN;
DROP INDEX IF EXISTS order_items_order_id_idx;
DROP INDEX IF EXISTS order_status_history_order_id_created_at_idx;
DROP INDEX IF EXISTS order_notes_order_id_idx;
DROP INDEX IF EXISTS products_active_category_id_idx;
COMMIT;
