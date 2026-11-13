-- Recommended row ("ផលិតផលណែនាំ"): all 4 fans first, then the top 4 previous picks.
-- The row shows 8 products; ranks 9+ are kept so they can be moved back up easily.
-- Reverse with drizzle/0018_feature_fans.down.sql (restores the 0017 starter order).
BEGIN;
UPDATE products SET featured_rank = NULL WHERE featured_rank IS NOT NULL;
UPDATE products SET featured_rank = 1 WHERE slug_public = 'battery-fan-ke6626';
UPDATE products SET featured_rank = 2 WHERE slug_public = 'battery-fan-ke6616';
UPDATE products SET featured_rank = 3 WHERE slug_public = 'battery-fan-ke8818';
UPDATE products SET featured_rank = 4 WHERE slug_public = 'battery-fan-ke6615';
UPDATE products SET featured_rank = 5 WHERE slug_public = 'led-flood-light-50w-400w';
UPDATE products SET featured_rank = 6 WHERE slug_public = 'solar-street-light';
UPDATE products SET featured_rank = 7 WHERE slug_public = 'solar-flood-light';
UPDATE products SET featured_rank = 8 WHERE slug_public = 'led-bulb-20w-50w';
UPDATE products SET featured_rank = 9 WHERE slug_public = 'led-downlight-round';
UPDATE products SET featured_rank = 10 WHERE slug_public = 'fuji-grey-cable-2x1-5-80m';
UPDATE products SET featured_rank = 11 WHERE slug_public = 'led-panel-light';
COMMIT;
