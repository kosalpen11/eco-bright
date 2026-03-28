import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleKm: text("title_km"),
  category: text("category").notNull(),
  categoryLabel: text("category_label").notNull(),
  categoryLabelKm: text("category_label_km"),
  useCase: text("use_case"),
  useCaseKm: text("use_case_km"),
  description: text("description").notNull(),
  descriptionKm: text("description_km"),
  imageUrl: text("image_url").notNull(),
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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ordersTable = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: text("invoice_id").notNull().unique(),
  shop: text("shop").notNull(),
  currency: text("currency").notNull(),
  itemCount: integer("item_count").notNull(),
  subtotal: numeric("subtotal", { mode: "number" }).notNull(),
  total: numeric("total", { mode: "number" }).notNull(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  note: text("note"),
  telegramUrl: text("telegram_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
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
});

export type ProductRow = typeof productsTable.$inferSelect;
export type ProductInsert = typeof productsTable.$inferInsert;
export type OrderRow = typeof ordersTable.$inferSelect;
export type OrderInsert = typeof ordersTable.$inferInsert;
export type OrderItemRow = typeof orderItemsTable.$inferSelect;
export type OrderItemInsert = typeof orderItemsTable.$inferInsert;
