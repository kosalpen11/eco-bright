import { getDb } from "@/db/client";
import {
  productMigrationRowsTable,
  type ProductMigrationRowInsert,
} from "@/db/schema";

export async function insertProductMigrationRows(rows: ProductMigrationRowInsert[]) {
  if (rows.length === 0) {
    return { count: 0 };
  }

  const db = getDb();
  await db.insert(productMigrationRowsTable).values(rows);
  return { count: rows.length };
}
