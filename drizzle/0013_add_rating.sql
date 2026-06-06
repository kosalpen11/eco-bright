-- Add rating column to products if it doesn't exist
ALTER TABLE products
ADD COLUMN IF NOT EXISTS rating numeric;
