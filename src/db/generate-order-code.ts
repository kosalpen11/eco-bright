import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { ordersTable } from "@/db/schema";

const ORDER_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ORDER_CODE_PREFIX = "ECO-";
const ORDER_CODE_LENGTH = 5;

function createCandidateCode() {
  const bytes = randomBytes(ORDER_CODE_LENGTH);
  let body = "";

  for (const byte of bytes) {
    body += ORDER_CODE_ALPHABET[byte % ORDER_CODE_ALPHABET.length];
  }

  return `${ORDER_CODE_PREFIX}${body}`;
}

export async function generateOrderCode(maxAttempts = 8): Promise<string> {
  const db = getDb();

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = createCandidateCode();
    const existing = await db
      .select({ id: ordersTable.id })
      .from(ordersTable)
      .where(eq(ordersTable.orderCode, candidate))
      .limit(1);

    if (!existing.length) {
      return candidate;
    }
  }

  throw new Error("Failed to generate a unique order code");
}
