CREATE TABLE "product_migration_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" text NOT NULL,
	"input_row_number" integer NOT NULL,
	"raw_id" text,
	"raw_title" text,
	"raw_proposed_category" text,
	"raw_category_label" text,
	"raw_storefront_fallback_category" text,
	"raw_use_case" text,
	"raw_description" text,
	"raw_image_url" text,
	"raw_price" text,
	"raw_old_price" text,
	"raw_badge" text,
	"raw_tags" text,
	"raw_currency" text,
	"raw_in_stock" text,
	"raw_pack_qty" text,
	"raw_hole_size" text,
	"raw_price3_colors" text,
	"raw_sort_order" text,
	"raw_is_active" text,
	"raw_needs_review" text,
	"raw_review_note" text,
	"source_sheet" text,
	"source_block" text,
	"source_row" text,
	"source_segment" text,
	"normalized_id" text,
	"normalized_title" text,
	"normalized_category" text,
	"normalized_category_label" text,
	"normalized_use_case" text,
	"normalized_description" text,
	"normalized_image_url" text,
	"normalized_price" numeric,
	"normalized_old_price" numeric,
	"normalized_tags" text[],
	"normalized_pack_qty" integer,
	"normalized_hole_size" text,
	"review_status" text NOT NULL,
	"review_flags" text[] DEFAULT '{}'::text[] NOT NULL,
	"review_summary" text NOT NULL,
	"title_fingerprint" text,
	"duplicate_key" text,
	"near_duplicate_key" text,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "image_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "raw_category" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "pack_qty" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "hole_size" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "source_sheet" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "source_block" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "source_row" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "source_segment" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "needs_review" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "review_flags" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "migration_batch_id" text;