-- Optional product specs for the product page specs table.
-- All columns are nullable; the storefront hides any row that is empty.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS spec_length text,
  ADD COLUMN IF NOT EXISTS spec_voltage text,
  ADD COLUMN IF NOT EXISTS spec_wattage text,
  ADD COLUMN IF NOT EXISTS spec_color text,
  ADD COLUMN IF NOT EXISTS spec_color_km text,
  ADD COLUMN IF NOT EXISTS warranty text,
  ADD COLUMN IF NOT EXISTS warranty_km text;
