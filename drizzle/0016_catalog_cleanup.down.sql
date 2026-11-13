-- Reverses drizzle/0016_catalog_cleanup.sql using the backup tables it created.
-- Keeps the nullable drift-fix columns (brand, rating, created_order, source_*, migration_batch_id)
-- because src/db/schema.ts selects them; brand values are cleared.
BEGIN;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
DROP INDEX IF EXISTS products_slug_public_key;
DROP INDEX IF EXISTS products_active_category_price_idx;
DROP INDEX IF EXISTS products_active_brand_price_idx;
UPDATE products p SET title = b.title, price = b.price, category = b.category,
  category_label = b.category_label, category_label_km = b.category_label_km, updated_at = b.updated_at
FROM products_backup_20261113 b WHERE b.id = p.id;
UPDATE products SET brand = NULL;
ALTER TABLE products DROP COLUMN IF EXISTS slug_public, DROP COLUMN IF EXISTS category_id;
UPDATE categories c SET name = b.name, slug = b.slug, updated_at = b.updated_at
FROM categories_backup_20261113 b WHERE b.id = c.id;
DELETE FROM categories WHERE id NOT IN (SELECT id FROM categories_backup_20261113);
ALTER TABLE categories DROP COLUMN IF EXISTS name_km, DROP COLUMN IF EXISTS sort_order;
COMMIT;

-- After confirming, drop the backups: DROP TABLE products_backup_20261113, product_variants_backup_20261113, categories_backup_20261113;
