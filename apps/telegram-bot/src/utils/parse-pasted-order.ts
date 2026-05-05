/**
 * Extracts a short order ID from a pasted full order message.
 *
 * Supports messages like:
 *   ECO BRIGHT LED & SOLAR
 *   Order ID: ECO-2026-20260417155707-R305
 *   ...
 *
 * Also handles short codes pasted directly: ECO-8K4P2
 */

const ORDER_ID_PATTERNS = [
  // Full format: "Order ID: ECO-XXXX" or "Short Order ID: ECO-XXXX"
  /(?:short\s+order\s+id|order\s+id|order code|order\s*#)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-]{3,})/i,
  // Bare ECO- prefix codes: ECO-8K4P2 or ECO-2026-0001
  /\b(ECO-[A-Z0-9\-]{3,})\b/i,
];

export interface ParsedPastedOrder {
  rawOrderId: string;
}

/**
 * Try to extract an order ID from pasted text.
 * Returns null if no recognisable order ID is found.
 */
export function parsePastedOrder(text: string): ParsedPastedOrder | null {
  const normalized = text.trim();

  for (const pattern of ORDER_ID_PATTERNS) {
    const match = normalized.match(pattern);
    if (match?.[1]) {
      return { rawOrderId: match[1].trim() };
    }
  }

  return null;
}
