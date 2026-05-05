import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: text("id").primaryKey(),
  brand: text("brand").notNull().default("ecobright"),
  title: text("title").notNull(),
  titleKm: text("title_km"),
  category: text("category").notNull(),
  categoryLabel: text("category_label").notNull(),
  categoryLabelKm: text("category_label_km"),
  useCase: text("use_case"),
  useCaseKm: text("use_case_km"),
  description: text("description").notNull(),
  descriptionKm: text("description_km"),
  imageUrl: text("image_url"),
  imageUrls: text("image_urls").array(),
  price: numeric("price", { mode: "number" }).notNull(),
  oldPrice: numeric("old_price", { mode: "number" }),
  badge: text("badge"),
  tags: text("tags").array(),
  currency: text("currency").notNull().default("USD"),
  inStock: boolean("in_stock").notNull().default(true),
  sortOrder: integer("sort_order"),
  isActive: boolean("is_active").notNull().default(true),
  rating: numeric("rating", { mode: "number" }),
  createdOrder: integer("created_order"),
  rawCategory: text("raw_category"),
  packQty: integer("pack_qty"),
  holeSize: text("hole_size"),
  sourceSheet: text("source_sheet"),
  sourceBlock: text("source_block"),
  sourceRow: text("source_row"),
  sourceSegment: text("source_segment"),
  needsReview: boolean("needs_review").notNull().default(false),
  reviewFlags: text("review_flags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  migrationBatchId: text("migration_batch_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productMigrationRowsTable = pgTable("product_migration_rows", {
  id: uuid("id").primaryKey().defaultRandom(),
  batchId: text("batch_id").notNull(),
  inputRowNumber: integer("input_row_number").notNull(),
  rawId: text("raw_id"),
  rawTitle: text("raw_title"),
  rawProposedCategory: text("raw_proposed_category"),
  rawCategoryLabel: text("raw_category_label"),
  rawStorefrontFallbackCategory: text("raw_storefront_fallback_category"),
  rawUseCase: text("raw_use_case"),
  rawDescription: text("raw_description"),
  rawImageUrl: text("raw_image_url"),
  rawPrice: text("raw_price"),
  rawOldPrice: text("raw_old_price"),
  rawBadge: text("raw_badge"),
  rawTags: text("raw_tags"),
  rawCurrency: text("raw_currency"),
  rawInStock: text("raw_in_stock"),
  rawPackQty: text("raw_pack_qty"),
  rawHoleSize: text("raw_hole_size"),
  rawPrice3Colors: text("raw_price3_colors"),
  rawSortOrder: text("raw_sort_order"),
  rawIsActive: text("raw_is_active"),
  rawNeedsReview: text("raw_needs_review"),
  rawReviewNote: text("raw_review_note"),
  sourceSheet: text("source_sheet"),
  sourceBlock: text("source_block"),
  sourceRow: text("source_row"),
  sourceSegment: text("source_segment"),
  normalizedId: text("normalized_id"),
  normalizedTitle: text("normalized_title"),
  normalizedCategory: text("normalized_category"),
  normalizedCategoryLabel: text("normalized_category_label"),
  normalizedUseCase: text("normalized_use_case"),
  normalizedDescription: text("normalized_description"),
  normalizedImageUrl: text("normalized_image_url"),
  normalizedPrice: numeric("normalized_price", { mode: "number" }),
  normalizedOldPrice: numeric("normalized_old_price", { mode: "number" }),
  normalizedTags: text("normalized_tags").array(),
  normalizedPackQty: integer("normalized_pack_qty"),
  normalizedHoleSize: text("normalized_hole_size"),
  reviewStatus: text("review_status").notNull(),
  reviewFlags: text("review_flags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  reviewSummary: text("review_summary").notNull(),
  titleFingerprint: text("title_fingerprint"),
  duplicateKey: text("duplicate_key"),
  nearDuplicateKey: text("near_duplicate_key"),
  importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ordersTable = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: text("invoice_id").notNull().unique(),
  shortOrderId: text("short_order_id").unique(),
  orderCode: text("order_code").unique(),
  status: text("status").notNull().default("pending"),
  shop: text("shop").notNull(),
  currency: text("currency").notNull(),
  itemCount: integer("item_count").notNull(),
  subtotal: numeric("subtotal", { mode: "number" }).notNull(),
  total: numeric("total", { mode: "number" }).notNull(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  note: text("note"),
  fulfillmentMethod: text("fulfillment_method"),
  adminNote: text("admin_note"),
  rejectionReason: text("rejection_reason"),
  telegramUserId: text("telegram_user_id"),
  telegramUsername: text("telegram_username"),
  telegramUrl: text("telegram_url"),
  telegramMessage: text("telegram_message"),
  telegramCustomerUserId: text("telegram_customer_user_id"),
  telegramCustomerUsername: text("telegram_customer_username"),
  telegramCustomerChatId: text("telegram_customer_chat_id"),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  rejectedAt: timestamp("rejected_at", { withTimezone: true }),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  reviewedByTelegramUserId: text("reviewed_by_telegram_user_id"),
  reviewedByName: text("reviewed_by_name"),
  source: text("source").notNull().default("web"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  title: text("title").notNull(),
  price: numeric("price", { mode: "number" }).notNull(),
  qty: integer("qty").notNull(),
  lineTotal: numeric("line_total", { mode: "number" }).notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderStatusHistoryTable = pgTable("order_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  action: text("action").notNull(),
  reason: text("reason"),
  actorType: text("actor_type").notNull(),
  actorId: text("actor_id"),
  actorName: text("actor_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deeplinkPayloadsTable = pgTable("deeplink_payloads", {
  id: uuid("id").primaryKey().defaultRandom(),
  payloadType: text("payload_type").notNull(),
  payloadJson: jsonb("payload_json").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const telegramSessionsTable = pgTable(
  "telegram_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    botRole: text("bot_role").notNull().default("customer"),
    telegramUserId: text("telegram_user_id").notNull(),
    telegramChatId: text("telegram_chat_id"),
    username: text("username"),
    language: text("language"),
    currentStep: text("current_step").notNull().default("idle"),
    pendingAdminAction: text("pending_admin_action"),
    source: text("source").notNull().default("telegram-bot"),
    draftOrderId: uuid("draft_order_id").references(() => ordersTable.id, {
      onDelete: "set null",
    }),
    resumeOrderId: uuid("resume_order_id").references(() => ordersTable.id, {
      onDelete: "set null",
    }),
    resumeOrderCode: text("resume_order_code"),
    lastPayloadReferenceId: uuid("last_payload_reference_id").references(
      () => deeplinkPayloadsTable.id,
      { onDelete: "set null" },
    ),
    lastStartPayload: text("last_start_payload"),
    sessionJson: jsonb("session_json").notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    roleUserUnique: uniqueIndex("telegram_sessions_role_user_unique").on(
      table.botRole,
      table.telegramUserId,
    ),
    roleStepIdx: index("telegram_sessions_role_step_idx").on(
      table.botRole,
      table.currentStep,
    ),
  }),
);

export const orderIdSequencesTable = pgTable("order_id_sequences", {
  id: uuid("id").primaryKey().defaultRandom(),
  year: integer("year").notNull(),
  sequence: integer("sequence").notNull().default(0),
  lastGeneratedAt: timestamp("last_generated_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProductRow = typeof productsTable.$inferSelect;
export type ProductInsert = typeof productsTable.$inferInsert;
export type ProductMigrationRow = typeof productMigrationRowsTable.$inferSelect;
export type ProductMigrationRowInsert = typeof productMigrationRowsTable.$inferInsert;
export type OrderRow = typeof ordersTable.$inferSelect;
export type OrderInsert = typeof ordersTable.$inferInsert;
export type OrderItemRow = typeof orderItemsTable.$inferSelect;
export type OrderItemInsert = typeof orderItemsTable.$inferInsert;
export type OrderStatusHistoryRow = typeof orderStatusHistoryTable.$inferSelect;
export type OrderStatusHistoryInsert = typeof orderStatusHistoryTable.$inferInsert;
export type DeeplinkPayloadRow = typeof deeplinkPayloadsTable.$inferSelect;
export type DeeplinkPayloadInsert = typeof deeplinkPayloadsTable.$inferInsert;
export type TelegramSessionRow = typeof telegramSessionsTable.$inferSelect;
export type TelegramSessionInsert = typeof telegramSessionsTable.$inferInsert;
