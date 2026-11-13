-- Reverses drizzle/0017_featured_products.sql.
BEGIN;
DROP INDEX IF EXISTS products_featured_rank_idx;
ALTER TABLE products DROP COLUMN IF EXISTS featured_rank;
COMMIT;
