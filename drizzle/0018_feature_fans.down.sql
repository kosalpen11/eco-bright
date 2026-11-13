-- Reverses drizzle/0018_feature_fans.sql: back to the 0017 starter order.
BEGIN;
UPDATE products SET featured_rank = NULL WHERE featured_rank IS NOT NULL;
UPDATE products SET featured_rank = 1 WHERE slug_public = 'led-flood-light-50w-400w';
UPDATE products SET featured_rank = 2 WHERE slug_public = 'solar-street-light';
UPDATE products SET featured_rank = 3 WHERE slug_public = 'solar-flood-light';
UPDATE products SET featured_rank = 4 WHERE slug_public = 'led-bulb-20w-50w';
UPDATE products SET featured_rank = 5 WHERE slug_public = 'led-downlight-round';
UPDATE products SET featured_rank = 6 WHERE slug_public = 'battery-fan-ke6626';
UPDATE products SET featured_rank = 7 WHERE slug_public = 'fuji-grey-cable-2x1-5-80m';
UPDATE products SET featured_rank = 8 WHERE slug_public = 'led-panel-light';
COMMIT;
