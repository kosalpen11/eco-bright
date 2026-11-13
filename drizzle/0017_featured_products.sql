-- Recommended products row on /products ("ផលិតផលណែនាំ").
-- featured_rank: 1 = first card; NULL = not recommended. Edit ranks in the DB to change the row.
-- Reverse with drizzle/0017_featured_products.down.sql.
BEGIN;

ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_rank integer;

-- Starter picks: one or two per category.
UPDATE products SET featured_rank = NULL WHERE featured_rank IS NOT NULL;
UPDATE products SET featured_rank = 1 WHERE slug_public = 'led-flood-light-50w-400w';
UPDATE products SET featured_rank = 2 WHERE slug_public = 'solar-street-light';
UPDATE products SET featured_rank = 3 WHERE slug_public = 'solar-flood-light';
UPDATE products SET featured_rank = 4 WHERE slug_public = 'led-bulb-20w-50w';
UPDATE products SET featured_rank = 5 WHERE slug_public = 'led-downlight-round';
UPDATE products SET featured_rank = 6 WHERE slug_public = 'battery-fan-ke6626';
UPDATE products SET featured_rank = 7 WHERE slug_public = 'fuji-grey-cable-2x1-5-80m';
UPDATE products SET featured_rank = 8 WHERE slug_public = 'led-panel-light';

CREATE INDEX IF NOT EXISTS products_featured_rank_idx ON products (featured_rank) WHERE featured_rank IS NOT NULL;

COMMIT;
