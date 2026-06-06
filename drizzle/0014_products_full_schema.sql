-- Migration: bring `products` table to the full schema
-- Adds missing columns, defaults, constraints and indexes safely.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS title_km text,
  ADD COLUMN IF NOT EXISTS category_label_km text,
  ADD COLUMN IF NOT EXISTS use_case_km text,
  ADD COLUMN IF NOT EXISTS description_km text,
  ADD COLUMN IF NOT EXISTS raw_category text,
  ADD COLUMN IF NOT EXISTS pack_qty integer,
  ADD COLUMN IF NOT EXISTS hole_size text,
  ADD COLUMN IF NOT EXISTS needs_review boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_flags text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS created_by_id text,
  ADD COLUMN IF NOT EXISTS stock_qty integer NOT NULL DEFAULT 0;

-- Ensure price and old_price precision
ALTER TABLE products
  ALTER COLUMN price TYPE numeric(12,2) USING price::numeric(12,2);
ALTER TABLE products
  ALTER COLUMN old_price TYPE numeric(12,2) USING old_price::numeric(12,2);

-- Ensure currency, in_stock, is_active, created_at, updated_at defaults
ALTER TABLE products
  ALTER COLUMN currency SET DEFAULT 'USD',
  ALTER COLUMN currency SET NOT NULL;
ALTER TABLE products
  ALTER COLUMN in_stock SET DEFAULT true;
ALTER TABLE products
  ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE products
  ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE products
  ALTER COLUMN updated_at SET DEFAULT now();

-- Add foreign key constraint to users.created_by_id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'products_created_by_id_fkey'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_created_by_id_fkey
      FOREIGN KEY (created_by_id)
      REFERENCES public.users(id)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;
END$$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS products_category_idx ON products USING btree (category);
CREATE INDEX IF NOT EXISTS products_needs_review_updated_at_idx ON products USING btree (needs_review, updated_at);
CREATE INDEX IF NOT EXISTS products_stock_qty_idx ON products USING btree (stock_qty);
CREATE INDEX IF NOT EXISTS products_title_idx ON products USING btree (title);
CREATE INDEX IF NOT EXISTS products_updated_at_idx ON products USING btree (updated_at);
