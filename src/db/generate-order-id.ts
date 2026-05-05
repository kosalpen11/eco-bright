import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { orderIdSequencesTable } from "@/db/schema";

/**
 * Generate a human-readable order ID in the format ECO-YYYY-NNNN
 * where YYYY is the current year and NNNN is a zero-padded sequence number
 */
export async function generateOrderId(): Promise<string> {
  const db = getDb();
  const now = new Date();
  const year = now.getFullYear();
  const paddedYear = year.toString();

  // Upsert: get or create sequence for this year
  const existing = await db
    .select()
    .from(orderIdSequencesTable)
    .where(eq(orderIdSequencesTable.year, year))
    .limit(1);

  let nextSequence = 1;

  if (existing.length > 0) {
    // Increment existing sequence
    const updated = await db
      .update(orderIdSequencesTable)
      .set({
        sequence: existing[0].sequence + 1,
        lastGeneratedAt: now,
        updatedAt: now,
      })
      .where(eq(orderIdSequencesTable.year, year))
      .returning({ sequence: orderIdSequencesTable.sequence });

    if (updated.length > 0) {
      nextSequence = updated[0].sequence;
    }
  } else {
    // Create new sequence for this year, starting at 1
    await db.insert(orderIdSequencesTable).values({
      year,
      sequence: 1,
      lastGeneratedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    nextSequence = 1;
  }

  // Format as ECO-YYYY-NNNN (4-digit zero-padded sequence)
  const paddedSequence = nextSequence.toString().padStart(4, "0");
  return `ECO-${paddedYear}-${paddedSequence}`;
}
